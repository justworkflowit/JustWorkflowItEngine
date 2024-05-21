import Ajv, { JSONSchemaType } from 'ajv';
import { IllegalArgumentException } from '../exceptions';
import ParameterDefinition from './parameterDefinitionSchema';

export interface IntegrationDetails {
  type: string;
  parameterTransformer: ParameterDefinition;
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
        parameterTransformer: {
          $ref: '#/definitions/parameterTransformerSchema',
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
    parameterTransformerSchema: {
      type: 'object',
      properties: {
        fieldset: {
          type: 'array',
          items: {
            $ref: '#/definitions/fieldsetSchema',
          } as any, // https://github.com/ajv-validator/ajv/issues/2392
        },
      },
      required: ['fieldset'],
      additionalProperties: false,
    },
    fieldsetSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
        },
        to: {
          type: 'string',
        },
        valueToKey: {
          type: 'boolean',
        },
        withValueFrom: {
          type: 'string',
        },
        withTemplate: {
          type: 'string',
        },
        toArray: {
          type: 'boolean',
        },
        via: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['date', 'commands'],
            },
            sourceFormat: {
              type: 'string',
            },
            format: {
              type: 'string',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        fromEach: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
            },
            to: {
              type: 'string',
            },
            flatten: {
              type: 'boolean',
            },
            fieldset: {
              type: 'array',
              items: {
                $ref: '#/definitions/fieldsetSchema',
              } as any, // https://github.com/ajv-validator/ajv/issues/2392
            },
          },
          required: ['field'],
          additionalProperties: false,
        },
      },
      required: [],
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

  throw new IllegalArgumentException(JSON.stringify(validate.errors!));
}

export default validateAndGetWorkflowDefinition;
