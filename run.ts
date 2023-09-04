import { readFileSync } from "fs";

import { ExtractEntrypointsAgent } from "./ExtractEntrypointsAgent";
import { WalkCallStackAgent } from "./WalkCallStackAgent";
import { DocumentationAgent} from "./DocumentationAgent";
import { WriteTestsAgent } from "./WriteTestsAgent";

async function run() {
  // const extractEntrypoint = new ExtractEntrypointsAgent('./examples/fastify/app.js');
  // await extractEntrypoint.run();

  // for (const entrypoint of extractEntrypoint.output) {
    // const entrypoint = extractEntrypoint.output[3]; 
    // const walkCallStack = new WalkCallStackAgent(entrypoint);
    // await walkCallStack.run();
  
    // const documentation = new DocumentationAgent(entrypoint, walkCallStack.output.slice(1));
    // await documentation.run();
  
    const writeTests = new WriteTestsAgent(readFileSync('./examples/fastify/doc/update-todos.md', 'utf-8'));
    await writeTests.run();
  // }
}

run()