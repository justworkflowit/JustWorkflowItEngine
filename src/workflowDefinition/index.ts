import Ajv from 'ajv';
import { readdirSync, readFileSync, realpathSync } from 'fs';
import { join } from 'path';
import { IllegalArgumentException, IllegalStateException } from '../exceptions';
import { performAnalysisOnTypes } from './typeAnalysis';
import { JustWorkflowItWorkflowDefinition } from './types';

const resolvedBaseDir = realpathSync(__dirname);
const schemaDir = join(resolvedBaseDir, 'jsonSchema');
const schemaFiles = readdirSync(schemaDir).filter((file) =>
  file.endsWith('.json')
);

const ajv = new Ajv({
  allowUnionTypes: true,
});

// eslint-disable-next-line no-restricted-syntax
for (const file of schemaFiles) {
  const schemaPath = join(schemaDir, file);
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  ajv.addSchema(schema, schema.$id || file);
}

function validateAndGetWorkflowDefinition(
  inputWorkflowDefinitionString: string
): JustWorkflowItWorkflowDefinition {
  const inputWorkflowDefinition = JSON.parse(inputWorkflowDefinitionString);

  const validateWorkflowDefinition = ajv.getSchema(
    'JustWorkflowItWorkflowDefinition'
  );
  if (!validateWorkflowDefinition) {
    throw new IllegalStateException(
      'This should never happen, something went wrong loading schemas from file'
    );
  }

  if (!validateWorkflowDefinition(inputWorkflowDefinition)) {
    throw new IllegalArgumentException(
      JSON.stringify(validateWorkflowDefinition.errors || 'Schema not found')
    );
  }

  performAnalysisOnTypes(inputWorkflowDefinition, ajv);

  return inputWorkflowDefinition;
}

export default validateAndGetWorkflowDefinition;
