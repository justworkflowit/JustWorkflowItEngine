import Ajv, { JSONSchemaType } from 'ajv';
import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import {
  JSONLogicSchema,
  JSONXformSchema,
  StepDefinition,
  JustWorkflowItWorkflowDefinition,
} from './types';
import { IllegalArgumentException } from '../exceptions';
import { nameof } from '../utils';

const xform = require('@perpk/json-xform');

const { mapToNewObject } = xform;

function getUserDefinition(
  workflowDefinition: JustWorkflowItWorkflowDefinition,
  $ref: string
): Schema {
  if (!workflowDefinition.definitions) {
    throw new Error(
      `Expected '${nameof<JustWorkflowItWorkflowDefinition>('definitions')}' to be present`
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
  workflowDefinition: JustWorkflowItWorkflowDefinition,
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
  transformer?: JSONXformSchema,
  data?: Record<string, unknown>
): Record<string, unknown> {
  return transformer
    ? mapToNewObject(data || {}, transformer)
    : JSONSchemaFaker.generate(schema);
}

function extractSteps(steps: Set<string>, logicNode: any): void {
  if (typeof logicNode === 'string') {
    steps.add(logicNode);
  } else if (Array.isArray(logicNode)) {
    logicNode.forEach(extractSteps);
  } else if (typeof logicNode === 'object') {
    Object.values(logicNode).forEach((node) => extractSteps(steps, node));
  }
}

function getNextSteps(transitionToStep: string | JSONLogicSchema): string[] {
  if (!transitionToStep) {
    return [];
  }

  if (typeof transitionToStep === 'string') {
    return [transitionToStep];
  }

  if (typeof transitionToStep === 'object' && transitionToStep) {
    // Extract possible step names from JSON Logic
    const steps = new Set<string>();

    extractSteps(steps, transitionToStep);
    return Array.from(steps);
  }

  throw new Error(
    `Invalid transitionToStep format: ${JSON.stringify(transitionToStep)}`
  );
}

export function performAnalysisOnTypes(
  inputWorkflowDefinition: JustWorkflowItWorkflowDefinition,
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

  if (inputWorkflowDefinition.definitions.workflowInput) {
    const userInput = generateDataFromSchema(
      getUserDefinition(inputWorkflowDefinition, '#/definitions/workflowInput')
    );

    validateSchema(
      ajv,
      getUserDefinition(inputWorkflowDefinition, '#/definitions/workflowInput'),
      userInput,
      `for workflowInput definition`
    );

    executionData.workflowInput = userInput;
  }

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

  // Track visited steps to avoid infinite loops
  const visitedSteps = new Set<string>();
  const stepsToProcess = [inputWorkflowDefinition.steps[0]];

  while (stepsToProcess.length > 0) {
    const step = stepsToProcess.pop();
    if (!step || visitedSteps.has(step.name)) {
      continue;
    }

    visitedSteps.add(step.name);

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
    if (step.transitionToStep) {
      const nextSteps = getNextSteps(step.transitionToStep);
      nextSteps.forEach((nextStep) => {
        stepsToProcess.push(getStepByName(inputWorkflowDefinition, nextStep));
      });
    }
  }
}
