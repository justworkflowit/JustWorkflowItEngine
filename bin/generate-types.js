const fs = require('fs');
const path = require('path');
const { compileFromFile } = require('json-schema-to-typescript');

const schemaPath = path.resolve(
  __dirname,
  '../src/workflowDefinition/workflowDefinitionSchema.json'
);
const outputPath = path.resolve(
  __dirname,
  '../src/workflowDefinition/types.ts'
);

compileFromFile(schemaPath)
  .then((ts) => fs.writeFileSync(outputPath, ts))
  .catch((error) => console.error('Error generating TypeScript types:', error));
