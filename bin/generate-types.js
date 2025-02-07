const fs = require('fs');
const path = require('path');
const { compileFromFile } = require('json-schema-to-typescript');

const schemaPath = path.resolve(
  __dirname,
  '../src/workflowDefinition/jsonSchema/workflowDefinitionSchema.json'
);
const outputPath = path.resolve(
  __dirname,
  '../src/workflowDefinition/types.ts'
);

const options = {
  style: {
    singleQuote: true,
    semi: false,
  },
  unreachableDefinitions: true,
  strictIndexSignatures: true,
};

compileFromFile(schemaPath, options)
  .then((ts) => fs.writeFileSync(outputPath, ts))
  .catch((error) => console.error('Error generating TypeScript types:', error));
