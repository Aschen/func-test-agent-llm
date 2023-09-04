import { writeFileSync, readFileSync, mkdirSync, appendFileSync } from 'fs';
import * as Path from "path"
import { execSync } from 'child_process';

import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

export class WriteTestsAgent {
  private model = new OpenAI({
    modelName: 'gpt-4',
    temperature: 0.0,
    maxTokens: -1,
  });
  private describeTestCasesTemplate = new PromptTemplate({
    template: `You are a developer.

Your final goal is to write Javascript functional tests for a route.

You will be given the route documentation and you need to describe the test cases that should be done for this route.

Route documentation:
{documentation}

Each test case will be executed against an empty database and should be independent from other test cases.
Explain the progress of the test case: 
 - Preparation: what should be done to prepare the test case: should I create entities in the database before running the test? if yes, I need to delete them after the test
 - Execution: what should be done to run the test case against the API
 - Checking: what should be done to check the result of the test case
 - Cleaning: what should be done to clean the test case: entities created in during the Preparation or Execution phase should be deleted

Each test case should be done only by using available API actions. 
Available API action:
 - get all todos
 - create a todo
 - update a todo
 - delete a todo
If a test case is not possible to be done with the available API action or if you need to mock an API response then you should not do the test case.

Use the DESCRIBE_TEST_CASE action multiple times to describe all the test case.

Example:

# Action:DESCRIBE_TEST_CASE
Test case N: <description of the test case in one sentence>

- Preparation: <description of the preparation phase>
- Execution: <description of the execution phase>
- Checking: <description of the checking phase>
- Cleaning: <description of the cleaning phase>
# end
`,
    inputVariables: ['documentation']
  });
  private writeTestsTemplate = new PromptTemplate({
    template: `You are a developer.
    
    Generate a test file for a route using the provided route documentation and test cases description.  

    First, you need to write the tests using Jest. Use the information from the {documentation} and {testCasesDescription} 
    to create a comprehensive set of tests that cover all possible scenarios and edge cases.
    You need to use the native fetch API available to browsers to call the API endpoints.
    Tests need to be written in {testsDir}.

    Each test case should be done only by using available API actions. 
    Available API action:
    - get all todos
    - create a todo
    - update a todo
    - delete a todo
    If a test case is not possible to be done with the available API action or if you need to mock an API response then you should not do the test case.
    You cannot import any external or local library, the test file must be self-contained.
    You will be given the current content of the test file.
    Once you have written the tests, you need to run them. If a test fails, try to fix it.
    If you tests are present and passing for all edge case then you are done.
    Use the result of the last action to decide your next action.

    You can execute the following actions:
    
    # Action:WRITE_TESTS
    filepath: Please specify the path to the test file for the route.
    code:
    \`\`\`js
    // Please write the entire code of the test file for the route here. Make sure to include all necessary imports, setup, teardown, and test cases.
    \`\`\`
    # end
    
    // try to run the tests and fix them if they fail
    # Action:RUN_TESTS
    # end
    
    // once the tests are passing, you are done
    # Action:DONE
    # end

    Last action result:
    {lastActionResult}

    Test file content:
    {testFileContent}
    
    Remember to write clear and concise tests that accurately reflect the functionality of the route. If a test 
    fails, try to fix it.
  `,
    inputVariables: ['documentation', 'testCasesDescription', 'testsDir', 'lastActionResult', 'testFileContent']
  });

  private debug: boolean = true;
  private promptCount = 0;
  private documentation: string;
  private testFilePath: string;
  private lastActionResult: string = '';
  private testsDir = './examples/fastify/tests'

  constructor (documentation: string) {
    this.documentation = documentation;

    if (this.debug) {
      mkdirSync('./prompts/', { recursive: true });
    }

    mkdirSync(this.testsDir, { recursive: true });
  }

  async run () {
    console.log('WriteTestsAgent: start writing tests');

    const prompt = await this.describeTestCasesTemplate.format({ documentation: this.documentation });

    const response = await this.model.call(prompt);

    if (this.debug) {
      writeFileSync(`./prompts/describe-test-cases.txt`, prompt + '\n==================================================================================\n' + response);
    }

    const testCases = this.parseDescribeTestCasesResponse(response);

    for (const testCase of testCases) {
      console.log(`WriteTestsAgent: start writing for ${testCase.split('\n')[0]}`);	
      await this.writeTestCase(testCase);
    }
  }

  private async writeTestCase (testCaseDescription: string) {
    let done: boolean = false;

    while (!done) {

      const prompt = await this.writeTestsTemplate.format({
        documentation: this.documentation,
        lastActionResult: this.lastActionResult,
        testCasesDescription: testCaseDescription,
        testFileContent: this.readTestFile(),
        testsDir: this.testsDir,
      });

      const response = await this.model.call(prompt);

      if (this.debug) {
        writeFileSync(`./prompts/write-tests-${this.promptCount++}.txt`, prompt + '\n==================================================================================\n' + response);
      }

      const sections = this.parseWriteTestsResponse(response);

      for (const {action, parameters} of sections) {
        done = await this.executeAction(action, parameters);
      }
    }
  }

  private executeAction (action, parameters) {
    switch (action) {
      case 'WRITE_TESTS':
        this.writeTests(parameters.filepath, parameters.code);
        this.lastActionResult = `Action:WRITE_TESTS\nSuccess`;
        return false;

      case 'RUN_TESTS':
        const result = this.runTests();
        
        if (result === 'All tests passed') {
          return true;
        }

        this.lastActionResult = `Action:RUN_TESTS\n${result}`
        return false;

      case 'DONE':
        return true;
      default:
        throw new Error(`WriteTestsAgent: unknown action ${action}`);
    }
  }

  private writeTests (filepath: string, code: string) {
    console.log(`WriteTestsAgent: write tests in ${filepath}`);

    this.testFilePath = filepath;
    mkdirSync(Path.dirname(filepath), { recursive: true });

    writeFileSync(filepath, code);
  }

  private runTests () {
    console.log(`WriteTestsAgent: run tests`);

    try {
      const output = execSync('npm run test');

      console.log('WriteTestsAgent: tests success');
      
      return 'All tests passed'
    }
    catch (error) {
      console.log('WriteTestsAgent: tests failed');
      
      return error.message;
    }
  }

  private readTestFile () {
    if (!this.testFilePath) {
      return '';
    }

    return readFileSync(this.testFilePath, 'utf-8');
  }

  private parseDescribeTestCasesResponse (response: string) {
    const actionPattern = /# Action:DESCRIBE_TEST_CASE([\s\S]*?)# end/g;
    const matches = response.matchAll(actionPattern);
  
    const describeTestCases = [];
  
    for (const match of matches) {
      const actionContent = match[1].trim();
      describeTestCases.push(actionContent);
    }
  
    return describeTestCases;  }

  private parseWriteTestsResponse (response: string) {
    const sectionPattern = /# Action:(.*?)\n([\s\S]*?)# end/g;
  
    const parameterPattern = /([^:\n]+):([^\n]*)/g;
  
    const sections: Array<{action: string, parameters: any}> = [];
  
    let match;
  
    while ((match = sectionPattern.exec(response)) !== null) {
      const action = match[1].trim();
      const content = match[2].trim();
  
      const parameters = {};
      let paramMatch;
      while ((paramMatch = parameterPattern.exec(content)) !== null) {
        const paramName = paramMatch[1].trim();
        const paramValue = paramMatch[2].trim();
        parameters[paramName] = paramValue;
      }
  
      const codeBlockPattern = /```js([\s\S]*?)```/g;
      let codeBlockMatch = codeBlockPattern.exec(content);
      if (codeBlockMatch) {
        parameters["code"] = codeBlockMatch[1].trim();
      }
  
      const sectionData = { action, parameters };
      sections.push(sectionData);
    }
  
    return sections;
  }
}
