import { writeFileSync, readFileSync, mkdirSync, appendFileSync } from 'fs';

import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { extractRequiresStatements, readFunctionCode } from './utils/code';

export class WalkCallStackAgent {
  private model = new OpenAI({
    modelName: 'gpt-4',
    temperature: 0.0,
    maxTokens: -1,
  });
  private promptTemplate = new PromptTemplate({
    template: `You are a developer.

    Your goal is to retrieve every user function called from the first function you will be given.
    
    First function:
    {entrypointCode}
        
    For each user function, note the name of every function that is called and read the code of these functions. 
    Check the require statements in the user functions to know which files you need to read.   
    You can ask to read many function at once. 
    To read the code of a function, you can use the following command:
    # Action:READ_FUNCTION
    filepath: // path to the file containing the function
    functionName: // name of the function
    # end

    User Functions:
    {userFunctions}

    When you have the code of all the user functions, you can stop.
    Use the following command to stop:
    # Action:STOP
    # end
    `,
    inputVariables: ['entrypointCode', 'userFunctions']
  })
  private entrypointCode: string;
  private userFunctions: string[] = []
  private debug: boolean = true;
  private promptCount = 0;

  /**
   * Array containing the code of all function involved in an API route
   */
  get output () {
    return [`\`\`\`js\n${this.entrypointCode}\`\`\``, ...this.userFunctions];
  }

  constructor (entrypointCode: string) {
    this.entrypointCode = entrypointCode;

    if (this.debug) {
      mkdirSync('./prompts/', { recursive: true });
    }
  }

  async run () {
    let done = false;

    console.log('WalkCallStackAgent: start retrieving user functions')

    while (!done) {
      console.log(`WalkCallStackAgent: ${this.userFunctions.length} user functions found`)

      const prompt = await this.promptTemplate.format({ entrypointCode: this.entrypointCode, userFunctions: this.userFunctions.join('\n') });

      const response = await this.model.call(prompt);

      if (this.debug) {
        writeFileSync(`./prompts/walk-call-stack-${this.promptCount++}.txt`, prompt + '\n==================================================================================\n' + response);
      }

      const sections = this.parseResponse(response);

      for (const { action, parameters} of sections) {
        done = await this.executeAction(action, parameters);
      }
    }
  }

  private async executeAction(action: string, parameters: any) {
    switch (action) {
      case 'READ_FUNCTION':
        console.log(`WalkCallStackAgent: Read code of function "${parameters.functionName}" in file "${parameters.filepath}"`)

        const functionCode = readFunctionCode(parameters.filepath, parameters.functionName);
        const requireStatements = extractRequiresStatements(parameters.filepath);
        this.userFunctions.push(`file: ${parameters.filepath}
functionName: ${parameters.functionName}
\`\`\`js
${requireStatements.join('\n')}

${functionCode}
\`\`\``);
        return false;

      case 'STOP':
        console.log(`WalkCallStackAgent: finished`)
        return true;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }


  private parseResponse(text: string) {
    const actionPattern = /# Action:(.*?)\n([\s\S]*?)# end/g;
    const parameterPattern = /([^:\n]+):([^\n]*)/g;
  
    const actions: Array<{action: string, parameters: any}> = [];
  
    let match;
  
    while ((match = actionPattern.exec(text)) !== null) {
      const action = match[1].trim();
      const actionContent = match[2].trim();
      const parameters = {};
  
      let paramMatch;
  
      while ((paramMatch = parameterPattern.exec(actionContent)) !== null) {
        const paramName = paramMatch[1].trim();
        const paramValue = paramMatch[2].trim();
        parameters[paramName] = paramValue;
      }
  
      actions.push({ action, parameters });
    }
  
    return actions;
  }
}
