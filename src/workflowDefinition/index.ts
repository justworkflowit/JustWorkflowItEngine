import Ajv from 'ajv';
import schemas from '../preloadedSchemas';
import { JustWorkflowItWorkflowDefinition } from './types';
import { performAnalysisOnTypes } from './typeAnalysis';
import { StepExecutor } from '../engine/stepExecutor';

const ajv = new Ajv({
  allowUnionTypes: true,
  strictTuples: false,
});

// Register schemas
Object.entries(schemas).forEach(([key, schema]) => {
  ajv.addSchema(schema, key);
});

function validateAndGetWorkflowDefinition(
  inputWorkflowDefinitionString: string,
  stepExecutors: Array<StepExecutor>
): JustWorkflowItWorkflowDefinition {
  const inputWorkflowDefinition = JSON.parse(
    inputWorkflowDefinitionString
  ) as JustWorkflowItWorkflowDefinition;

  const validateWorkflowDefinition = ajv.getSchema(
    'JustWorkflowItWorkflowDefinition'
  );
  if (!validateWorkflowDefinition) {
    throw new Error(
      'This should never happen, something went wrong loading schemas'
    );
  }

  if (!validateWorkflowDefinition(inputWorkflowDefinition)) {
    throw new Error(
      JSON.stringify(validateWorkflowDefinition.errors || 'Schema not found')
    );
  }

  performAnalysisOnTypes(inputWorkflowDefinition, ajv, stepExecutors);

  return inputWorkflowDefinition;
}

export default validateAndGetWorkflowDefinition;
