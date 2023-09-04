import { writeFileSync, readFileSync, mkdirSync, appendFileSync } from 'fs';

import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { extractRequiresStatements } from './utils/code';

export class ExtractEntrypointsAgent {
  private model = new OpenAI({
    modelName: 'gpt-4',
    temperature: 0.0,
    maxTokens: -1,
  });
  private promptTemplate = new PromptTemplate({
    template: `You are a Javascript developer.

    You will be given a file containing API entrypoint code as fastify route definition.
    For each route definition, extract the entire code of the route.
    Format your answer like this:
    
    # Action:EXTRACT_ROUTE_DEFINITION
    code:
    \`\`\`js
    // route definition code
    \`\`\`
    # end
    
    Javascript code:
    {jsCode}
    `,
    inputVariables: ['jsCode']
  })
  private debug: boolean = true;
  private filepath: string;
  private promptCount = 0;

  /**
   * Array containing the code of each route entrypoint
   */
  public output: string[] = [];

  constructor (filepath: string) {
    this.filepath = filepath;

    if (this.debug) {
      mkdirSync('./prompts/', { recursive: true });
    }
  }

  async run () {
    console.log(`ExtractEntrypointsAgent: start extracting entrypoints from ${this.filepath}`);

    const jsCode = readFileSync(this.filepath, 'utf-8');
    const prompt = await this.promptTemplate.format({ jsCode });

    const response = await this.model.call(prompt);

    if (this.debug) {
      writeFileSync(`./prompts/extract-entrypoint-${this.promptCount++}.txt`, prompt + '\n==================================================================================\n' + response);
    }

    const sections = this.parseResponse(response);

    for (const { action, parameters} of sections) {
      await this.executeAction(action, parameters);
    }

    console.log(`ExtractEntrypointsAgent: ${this.output.length} route entrypoints extracted`)
  }

  private async executeAction(action: string, parameters: any) {
    switch (action) {
      case 'EXTRACT_ROUTE_DEFINITION':
        console.log(`ExtractEntrypointsAgent: route entrypoint extracted`)
        this.output.push(`${extractRequiresStatements(this.filepath).join('\n')}\n\n${parameters.code}`)
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private parseResponse(textResponse) {
    const sectionPattern = /# Action:(.*?)\n([\s\S]*?)# end/g;
  
    const sections: Array<{ action: string, parameters: any}> = [];
  
    let match;
  
    while ((match = sectionPattern.exec(textResponse)) !== null) {
      const action = match[1].trim();
      const content = match[2].trim();
  
      // Define specific parameter patterns for the parameters you want to capture
      const parameterPattern = /code:[^\n]*\n([\s\S]*)/;
  
      const parameters = {};
  
      // Match the code parameter separately
      const codeMatch = parameterPattern.exec(content);
  
      if (codeMatch) {
        parameters["code"] = codeMatch[1].trim();
      }
  
      const sectionData = { action, parameters };
      sections.push(sectionData);
    }
  
    return sections;
  }
}
