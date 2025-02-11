import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

// Get __dirname equivalent in ESM
const filename = fileURLToPath(import.meta.url);
const dir_name = dirname(filename);

const schemaDir = join(dir_name, '../src/workflowDefinition/jsonSchema');
const schemaFiles = readdirSync(schemaDir).filter((file) =>
  file.endsWith('.json')
);

const schemas = schemaFiles.reduce((acc, file) => {
  const schemaPath = join(schemaDir, file);
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  acc[schema.$id || file] = schema;
  return acc;
}, {});

const output = `export default ${JSON.stringify(schemas, null, 2)};`;

writeFileSync(join(dir_name, '../src/preloadedSchemas.ts'), output);
console.log('✅ Schemas preloaded into preloadedSchemas.ts');
