import { readFileSync } from 'fs';
import { join, dirname } from 'path';

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

function fixedPath (filePath: string) {
  return filePath.endsWith('.js') ? filePath : `${filePath}.js`
}

export function extractRequiresStatements(filePath) {
  const jsCode = readFileSync(fixedPath(filePath), 'utf-8');

  const requirePattern = /const\s+([\w\s,{}]+)\s+=\s+require\(['"]\.(\/[^'"]+)['"]\);?/g;

  const localRequireStatements: string[] = [];
  let match;

  while ((match = requirePattern.exec(jsCode)) !== null) {
    const variableDeclaration = match[1];
    const relativePath = match[2];
    
    // Resolve the relative path based on the filePath
    const absolutePath = join(dirname(fixedPath(filePath)), relativePath);

    // Create the updated require statement with the resolved path
    const updatedRequireStatement = `const ${variableDeclaration} = require('./${absolutePath}');`;
    
    localRequireStatements.push(updatedRequireStatement);
  }

  return localRequireStatements;
}

export function readFunctionCode(filePath: string, functionName: string) {
  const sourceCode = readFileSync(fixedPath(filePath), 'utf-8');

  const ast = acorn.parse(sourceCode, { ecmaVersion: 'latest' });

  let targetFunctionCode: string|null = null;

  walk.simple(ast, {
    FunctionDeclaration(node: any) {
      if (node.id.name === functionName) {
        // Extract the source code of the target function
        targetFunctionCode = sourceCode.substring(node.start, node.end);
      }
    },
  });

  if (targetFunctionCode) {
    return targetFunctionCode;
  } else {
    throw new Error(`Function "${functionName}" not found in the source code.`);
  }
}