import Ajv, { JSONSchemaType } from 'ajv';
import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import {
  ParameterTransformerSchema,
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
  transformer?: ParameterTransformerSchema,
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
    const { parameterDefinition, resultDefinition, parameterTransformer } =
      step.integrationDetails;

    if (parameterDefinition) {
      const userParameters = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, parameterDefinition.$ref),
        parameterTransformer,
        executionData
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, parameterDefinition.$ref),
        userParameters,
        `at step '${step.name}' for parameter definition`
      );

      executionData[`${step.name}Parameters`] = userParameters;
    }

    if (resultDefinition) {
      const userResults = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, resultDefinition.$ref)
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, resultDefinition.$ref),
        userResults,
        `at step '${step.name}' for result definition`
      );

      executionData[`${step.name}Result`] = userResults;
    }
  });

  let step = inputWorkflowDefinition.steps[0];
  while (step) {
    const { parameterTransformer, parameterDefinition, resultDefinition } =
      step.integrationDetails;

    if (parameterDefinition) {
      const userParameters = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, parameterDefinition.$ref),
        parameterTransformer,
        executionData
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, parameterDefinition.$ref),
        userParameters,
        `in step named '${step.name}' for parameters`
      );
    }

    if (resultDefinition) {
      const userResults = generateDataFromSchema(
        getUserDefinition(inputWorkflowDefinition, resultDefinition.$ref)
      );

      validateSchema(
        ajv,
        getUserDefinition(inputWorkflowDefinition, resultDefinition.$ref),
        userResults,
        `at step '${step.name}' for result definition`
      );
    }

    if (!step.transitionToStep) {
      break;
    }

    step = getStepByName(inputWorkflowDefinition, step.transitionToStep);
  }
}
