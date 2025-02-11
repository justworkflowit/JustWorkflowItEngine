import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { compileFromFile } from 'json-schema-to-typescript';

// Get __dirname equivalent in ESM
const filename = fileURLToPath(import.meta.url);
const dir_name = dirname(filename);

const schemaPath = resolve(
  dir_name,
  '../src/workflowDefinition/jsonSchema/workflowDefinitionSchema.json'
);
const outputPath = resolve(dir_name, '../src/workflowDefinition/types.ts');

const options = {
  style: {
    singleQuote: true,
    semi: false,
  },
  unreachableDefinitions: true,
  strictIndexSignatures: true,
};

compileFromFile(schemaPath, options)
  .then((ts) => writeFileSync(outputPath, ts))
  .catch((error) => console.error('Error generating TypeScript types:', error));
