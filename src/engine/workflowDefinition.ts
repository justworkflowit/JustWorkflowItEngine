import Ajv, { JSONSchemaType } from 'ajv';
import { IllegalArgumentException } from '../exceptions';

interface IntegrationDetails {
  type: string;
}

interface StepDefinition {
  name: string;
  retries: number;
  timeoutSeconds: number;
  transitionToStep: string | null;
  integrationDetails: IntegrationDetails;
}

interface WorkflowDefinitionInitial {
  workflowName: string;
  steps: Array<StepDefinition>;
}

const workflowDefinitionSchema: JSONSchemaType<WorkflowDefinitionInitial> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    workflowName: { type: 'string' },
    steps: {
      type: 'array',
      items: { $ref: '#/definitions/stepDefinitionSchema' } as any, // https://github.com/ajv-validator/ajv/issues/2392
    },
  },
  definitions: {
    stepDefinitionSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        retries: { type: 'integer' },
        timeoutSeconds: { type: 'integer' },
        transitionToStep: { type: 'string' },
        integrationDetails: { $ref: '#/definitions/integrationDetailSchema' },
      },
      required: ['name', 'retries', 'timeoutSeconds', 'integrationDetails'],
      additionalProperties: false,
    },
    integrationDetailSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
      },
      required: ['type'],
      additionalProperties: false,
    },
  },
  required: ['workflowName', 'steps'],
  additionalProperties: false,
};

export type WorkflowDefinition = WorkflowDefinitionInitial;

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
