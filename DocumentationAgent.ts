import { writeFileSync, mkdirSync } from 'fs';

import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

export class DocumentationAgent {
  private model = new OpenAI({
    modelName: 'gpt-4',
    temperature: 0.0,
    maxTokens: -1,
  });
  private promptTemplate = new PromptTemplate({
    template: `You are a developer.

    Your goal is to write the technical API documentation for an API route.
    You will be given the route entrypoint and the code of all the user functions involved.    

    Entrypoint:
    {entrypointCode}

    User functions:
    {userFunctions}

    Follow this template:
filename: <actionName>-todos.md
## METHOD /api/path

<description>

### Request

The request should be a JSON object with the following properties:

- \`<property1>\` (<type>, <required|optional>): <description>
- \`<property2>\` (<type>, <required|optional>): <description>

Example with CURL:

\`\`\`bash
<curl command>
\`\`\`

### Response

<description of the result and response format>

Example:

\`\`\`json
<JSON response example>
\`\`\`

### Error

<description of the error response format>

<description of possible errors>

- \`<error1>\`: <description>
- \`<error2>\`: <description>

Example:

\`\`\`json
<example of error response format>
\`\`\``,
    inputVariables: ['entrypointCode', 'userFunctions']
  });
  private debug: boolean = true;
  private promptCount = 0;
  private entrypointCode: string;
  private userFunctions: string[];
  private docDir = './examples/fastify/doc'

  /**
   * Contains the filepath (index 0) and the documentation content (index 1)
   */
  public output: string[] = [];

  constructor (entrypointCode: string, userFunctions: string[]) {
    this.entrypointCode = entrypointCode;
    this.userFunctions = userFunctions;

    if (this.debug) {
      mkdirSync('./prompts/', { recursive: true });
    }

    mkdirSync(this.docDir, { recursive: true });
  }

  async run () {
    console.log('DocumentationAgent: start documenting entrypoint');

    const prompt = await this.promptTemplate.format({
      entrypointCode: this.entrypointCode,
      userFunctions: this.userFunctions.join('\n\n')
    });

    const response = await this.model.call(prompt);

    if (this.debug) {
      writeFileSync(`./prompts/documentation-${this.promptCount++}.txt`, prompt + '\n==================================================================================\n' + response);
    }

    const { filename, documentation } = this.parseResponse(response);

    const filepath = `${this.docDir}/${filename.endsWith('.md') ? filename : filename + '.md'}`;

    console.log(`DocumentationAgent: write documentation to ${filepath}`);

    writeFileSync(`${filepath}`, documentation);

    this.output.push(`${filepath}`);
    this.output.push(documentation);
  }

  private parseResponse(text: string) {
    const filenamePattern = /filename:\s*(.*?)\.md\s*\n/;
    const match = text.match(filenamePattern);
    
    if (match) {
      const filename = match[1].trim();
      // Remove the line containing the filename
      const documentation = text.replace(filenamePattern, '');
      return { filename, documentation };
    }
  
    throw new Error('DocumentationAgent: could not parse response, filename not found')
  }
}
