import { readFileSync } from "fs";

import { ExtractEntrypointsAgent } from "./ExtractEntrypointsAgent";
import { WalkCallStackAgent } from "./WalkCallStackAgent";
import { DocumentationAgent} from "./DocumentationAgent";
import { WriteTestsAgent } from "./WriteTestsAgent";

async function run() {
  const extractEntrypoint = new ExtractEntrypointsAgent('./examples/fastify/app.js');
  await extractEntrypoint.run();

  for (const entrypoint of extractEntrypoint.output) {
    const walkCallStack = new WalkCallStackAgent(entrypoint);
    await walkCallStack.run();
  
    const documentation = new DocumentationAgent(entrypoint, walkCallStack.output.slice(1));
    await documentation.run();
  
    const writeTests = new WriteTestsAgent(documentation.output[1]);
    await writeTests.run();
  }
}

run()