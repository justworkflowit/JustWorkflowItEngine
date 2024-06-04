import Ajv, { JSONSchemaType } from 'ajv';
import { IllegalArgumentException } from '../exceptions';
import ParameterTransformerDefinition from './parameterTransformerDefinitionSchema';

export interface IntegrationDetails {
  type: string;
  parameterTransformer: ParameterTransformerDefinition;
  parameterDefinition: { $ref: string };
  resultDefinition: { $ref: string };
}

interface StepDefinition {
  name: string;
  retries: number;
  timeoutSeconds: number;
  transitionToStep: string | null;
  integrationDetails: IntegrationDetails;
}

interface JSONSchema {
  type?: string | string[];
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  $ref?: string;
}

interface DefinitionsSchema {
  [key: string]: JSONSchema;
}

interface WorkflowDefinitionInitial {
  workflowName: string;
  steps: Array<StepDefinition>;
  definitions: DefinitionsSchema;
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
    definitions: { $ref: '#/definitions/definitionsSchema' } as any, // https://github.com/ajv-validator/ajv/issues/2392
  },
  definitions: {
    definitionsSchema: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/definitionSchema',
      } as any,
      required: [],
    },
    definitionSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        properties: {
          type: 'object',
          additionalProperties: {
            $ref: '#/definitions/definitionSchema',
          } as any,
          required: [],
        },
        items: { $ref: '#/definitions/definitionSchema' } as any, // for nested definitions
        required: { type: 'array', items: { type: 'string' } },
        additionalProperties: { type: 'boolean' },
      },
      required: ['type'],
      additionalProperties: false,
    },
    stepDefinitionSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        retries: { type: 'integer' },
        timeoutSeconds: { type: 'integer' },
        transitionToStep: {
          oneOf: [
            { type: 'null' } as any, // Does not compile without this
            { type: 'string' },
          ],
        },
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
        parameterDefinition: {
          $ref: '#/definitions/refSchema',
        },
        resultDefinition: {
          $ref: '#/definitions/refSchema',
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
    refSchema: {
      type: 'object',
      properties: {
        $ref: { type: 'string' },
      },
      required: ['$ref'],
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

  const validateWorkflowDefinition = ajv.compile<WorkflowDefinition>(
    workflowDefinitionSchema
  );

  if (!validateWorkflowDefinition(inputWorkflowDefinition)) {
    throw new IllegalArgumentException(
      JSON.stringify(validateWorkflowDefinition.errors!)
    );
  }

  const emptySchemaForUserDefinitionValidation: JSONSchemaType<{}> = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
    definitions: inputWorkflowDefinition.definitions as any,
  };

  // Step 1: pull out user defined definitions and validate they are JSONSchema compatible
  const validateEmptyUserDefinedSchema = ajv.compile<{}>(
    emptySchemaForUserDefinitionValidation
  );
  if (!validateEmptyUserDefinedSchema({})) {
    throw new IllegalArgumentException(
      JSON.stringify(validateEmptyUserDefinedSchema.errors!)
    );
  }

  // TODO: walk through all parameter and output definitions using execution data to validate that all type definitions have been set up correctly
  // TODO: iterate over each step and perform static analysis

  // let step = inputWorkflowDefinition.steps[0];
  // while (step != null) {
  //   step
  // }
  // inputWorkflowDefinition.definitions

  return inputWorkflowDefinition;
}

export default validateAndGetWorkflowDefinition;
