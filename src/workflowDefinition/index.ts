import Ajv, { JSONSchemaType } from 'ajv';
import { IllegalArgumentException } from '../exceptions';
import { performAnalysisOnTypes } from './typeAnalysis';
import { WorkflowDefinition } from './types';
import WorkflowDefinitionSchema from './workflowDefinitionSchema.json';

export const workflowDefinitionSchema: JSONSchemaType<WorkflowDefinition> =
  WorkflowDefinitionSchema as any;

function validateAndGetWorkflowDefinition(
  inputWorkflowDefinitionString: string
): WorkflowDefinition {
  const ajv = new Ajv();

  const inputWorkflowDefinition = JSON.parse(inputWorkflowDefinitionString);

  const validateWorkflowDefinition = ajv.compile<WorkflowDefinition>(
    workflowDefinitionSchema
  );

  if (!validateWorkflowDefinition(inputWorkflowDefinition)) {
    throw new IllegalArgumentException(
      JSON.stringify(validateWorkflowDefinition.errors!)
    );
  }

  performAnalysisOnTypes(inputWorkflowDefinition, ajv);

  return inputWorkflowDefinition;
}

export default validateAndGetWorkflowDefinition;
