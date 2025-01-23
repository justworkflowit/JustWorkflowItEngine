import Ajv, { JSONSchemaType } from 'ajv';
import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import {
  InputTransformerSchema,
  StepDefinition,
  WorkflowDefinition,
} from './types';
import { IllegalArgumentException } from '../exceptions';
import { nameof } from '../utils';

const xform = require('@perpk/json-xform');

const { mapToNewObject } = xform;

function getUserDefinition(
  workflowDefinition: WorkflowDefinition,
  $ref: string
): Schema {
  if (!workflowDefinition.definitions) {
    throw new Error(
      `Expected '${nameof<WorkflowDefinition>('definitions')}' to be present`
    );
  }

  const definitionKey = $ref.replace('#/definitions/', '');
  const userDefinition = workflowDefinition.definitions[definitionKey];

  if (!userDefinition) {
    throw new Error(`No definition found for reference '${$ref}'`);
  }

  return userDefinition as Schema;
}

function getStepByName(
  workflowDefinition: WorkflowDefinition,
  stepName: string
): StepDefinition {
  const step = workflowDefinition.steps.find(
    (newStep) => newStep.name === stepName
  );

  if (!step) {
    throw new Error(`No step found with name '${stepName}'`);
  }

  return step;
}

function validateSchema(
  ajv: Ajv,
  schema: Schema,
  data: Record<string, unknown>,
  context: string
): void {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    throw new IllegalArgumentException(
      `Validation failed ${context}: ${JSON.stringify(validate.errors)}. Used data '${JSON.stringify(data)}'`
    );
  }
}

function generateDataFromSchema(
  schema: Schema,
  transformer?: InputTransformerSchema,
  data?: Record<string, unknown>
): Record<string, unknown> {
  return transformer
    ? mapToNewObject(data || {}, transformer)
    : JSONSchemaFaker.generate(schema);
}

export function performAnalysisOnTypes(
  inputWorkflowDefinition: WorkflowDefinition,
  ajv: Ajv
): void {
  const executionData: Record<string, unknown> = {};

  const emptySchemaForUserDefinitionValidation: JSONSchemaType<{}> = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
    definitions: inputWorkflowDefinition.definitions as any,
  };

  validateSchema(
    ajv,
    emptySchemaForUserDefinitionValidation as Schema,
    {},
    'for user-defined definitions'
  );

  inputWorkflowDefinition.steps.forEach((step) => {
    const { inputDefinition, outputDefinition, inputTransformer } =
      step.integrationDetails;

    if (inputDefinition) {
      const userInput = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, inputDefinition.$ref),
        inputTransformer,
        executionData
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, inputDefinition.$ref),
        userInput,
        `at step '${step.name}' for input definition`
      );

      executionData[`${step.name}Input`] = userInput;
    }

    if (outputDefinition) {
      const userOutput = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, outputDefinition.$ref)
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, outputDefinition.$ref),
        userOutput,
        `at step '${step.name}' for output definition`
      );

      executionData[`${step.name}Output`] = userOutput;
    }
  });

  let step = inputWorkflowDefinition.steps[0];
  while (step) {
    const { inputTransformer, inputDefinition, outputDefinition } =
      step.integrationDetails;

    if (inputDefinition) {
      const userInput = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, inputDefinition.$ref),
        inputTransformer,
        executionData
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, inputDefinition.$ref),
        userInput,
        `in step named '${step.name}' for input`
      );
    }

    if (outputDefinition) {
      const userOutput = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, outputDefinition.$ref)
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, outputDefinition.$ref),
        userOutput,
        `at step '${step.name}' for output definition`
      );
    }

    if (!step.transitionToStep) {
      break;
    }

    step = getStepByName(inputWorkflowDefinition, step.transitionToStep);
  }
}
