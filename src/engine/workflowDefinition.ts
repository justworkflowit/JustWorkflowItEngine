import Ajv, { JTDDataType } from 'ajv/dist/jtd';
import { IllegalArgumentException } from '../exceptions';

const workflowDefinitionSchema = {
  properties: {
    workflowName: { type: 'string' },
    steps: { elements: { ref: 'stepDefinitionSchema' } },
  },
  definitions: {
    stepDefinitionSchema: {
      properties: {
        name: { type: 'string' },
        retries: { type: 'int32' },
        timeoutSeconds: { type: 'int32' },
        transitionToStep: { type: 'string' },
        integrationDetails: { ref: 'integrationDetailSchema' },
        transitionToStepName: { type: 'string' },
      },
    },
    integrationDetailTypes: { enum: ['aws:lambda', 'aws:sns'] },
    integrationDetailSchema: {
      properties: {
        type: { ref: 'integrationDetailTypes' },
      },
    },
  },
} as const;

export type WorkflowDefinition = JTDDataType<typeof workflowDefinitionSchema>;

function validateAndGetWorkflowDefinition(
  inputWorkflowDefinitionString: string
): WorkflowDefinition {
  const ajv = new Ajv();

  const inputWorkflowDefinition = JSON.parse(inputWorkflowDefinitionString);

  const validate = ajv.compile<WorkflowDefinition>(workflowDefinitionSchema);

  if (validate(inputWorkflowDefinition)) {
    return inputWorkflowDefinition;
  }
  throw new IllegalArgumentException(validate.errors!.join(','));
}

export default validateAndGetWorkflowDefinition;
