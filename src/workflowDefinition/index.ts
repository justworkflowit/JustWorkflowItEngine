import { JustWorkflowItWorkflowDefinition } from './types';
import { performAnalysisOnTypes } from './typeAnalysis';
import { StepExecutor } from '../engine/stepExecutor';
import { getAjv } from './ajvInitialize';

function validateAndGetWorkflowDefinition(
  inputWorkflowDefinitionString: string,
  stepExecutors: Array<StepExecutor>,
  workflowInput?: Record<string, unknown>
): JustWorkflowItWorkflowDefinition {
  const inputWorkflowDefinition = JSON.parse(
    inputWorkflowDefinitionString
  ) as JustWorkflowItWorkflowDefinition;

  const ajv = getAjv();
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

  performAnalysisOnTypes(
    inputWorkflowDefinition,
    ajv,
    stepExecutors,
    workflowInput
  );

  return inputWorkflowDefinition;
}

export default validateAndGetWorkflowDefinition;
