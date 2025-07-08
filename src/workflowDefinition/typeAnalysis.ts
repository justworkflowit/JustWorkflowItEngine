/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import Ajv from 'ajv';
import {
  JSONSchemaFaker,
  JSONSchemaFakerDefine,
  Schema,
} from 'json-schema-faker';
import {
  JSONXformSchema,
  StepDefinition,
  JustWorkflowItWorkflowDefinition,
  JSONLogicSchema,
} from './types';
import { IllegalArgumentException } from '../exceptions';
import { nameof } from '../utils';
import { StepExecutor } from '../engine/stepExecutor';

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
    : (JSONSchemaFaker.generate(schema) as Record<string, unknown>);
}

function getValueByJsonXformSchemaPath(
  data: Record<string, unknown>,
  path: string | undefined
): unknown {
  if (!path) {
    return undefined;
  }

  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);
}

function extractStepsFromJsonLogicStatement(
  steps: Set<string>,
  logicNode: any
): void {
  if (!logicNode) return;

  // Base Case: Only add strings, ignoring numbers
  if (typeof logicNode === 'string') {
    steps.add(logicNode);
    return;
  }

  if (Array.isArray(logicNode)) {
    logicNode.forEach((node) =>
      extractStepsFromJsonLogicStatement(steps, node)
    );
    return;
  }

  if (typeof logicNode === 'object') {
    for (const key of Object.keys(logicNode)) {
      const value = logicNode[key];

      if (key === 'if' || key === '?:') {
        if (Array.isArray(value) && value.length >= 3) {
          for (let i = 1; i < value.length; i += 2) {
            extractStepsFromJsonLogicStatement(steps, value[i]);
          }
          if (value.length % 2 === 1) {
            extractStepsFromJsonLogicStatement(steps, value[value.length - 1]);
          }
        }
      } else if (key === 'or' || key === 'and') {
        if (Array.isArray(value)) {
          value.forEach((v) => extractStepsFromJsonLogicStatement(steps, v));
        }
      } else {
        extractStepsFromJsonLogicStatement(steps, value);
      }
    }
  }
}

function getNextSteps(transitionToStep: string | JSONLogicSchema): string[] {
  if (!transitionToStep) {
    return [];
  }

  if (typeof transitionToStep === 'string') {
    return [transitionToStep];
  }

  if (typeof transitionToStep === 'object') {
    const steps = new Set<string>();
    extractStepsFromJsonLogicStatement(steps, transitionToStep);
    return Array.from(steps);
  }

  throw new Error(
    `Invalid transitionToStep format: ${JSON.stringify(transitionToStep)}`
  );
}

function applyInputTransformer(
  stepName: string,
  inputTransformer: JSONXformSchema,
  executionData: Record<string, unknown>,
  traversalSteps: Array<string>
): Record<string, unknown> {
  const transformedData: Record<string, unknown> = mapToNewObject(
    executionData || {},
    inputTransformer
  );
  for (const field of inputTransformer.fieldset) {
    // Some additional validation just to be nice, may have to heavily improve this in the future to actually fully implement the JSON xform source lookup, which does not sound fun.
    if (field.from) {
      const sourceValue = getValueByJsonXformSchemaPath(
        executionData,
        field.from
      );
      if (sourceValue === undefined) {
        throw new Error(
          `Transformation error: Missing expected field '${field.from}' in execution data. The graph traversal path taken: ${traversalSteps.join(' -> ')}`
        );
      }
    }
  }
  return {
    ...executionData,
    [`${stepName}Input`]: transformedData,
  };
}

function traverseSteps(
  inputWorkflowDefinition: JustWorkflowItWorkflowDefinition,
  ajv: Ajv,
  stepExecutors: Array<StepExecutor>,
  currentStep: StepDefinition,
  executionData: Record<string, unknown>,
  visitedSteps: Array<string>
): void {
  if (new Set(visitedSteps).has(currentStep.name)) {
    return;
  }
  visitedSteps.push(currentStep.name);

  const { type, inputDefinition, outputDefinition, inputTransformer, config } =
    currentStep.integrationDetails;

  const matchingExecutors = stepExecutors.filter(
    (stepExecutor) => stepExecutor.type === currentStep.integrationDetails.type
  );
  if (matchingExecutors.length > 1) {
    throw new Error(
      `Multiple registered step executors found for type '${type}'`
    );
  }

  const executor = matchingExecutors[0];
  if (!executor) {
    throw new Error(`No registered step executor found for type '${type}'`);
  }

  if (executor.configDefinition) {
    if (!config) {
      throw new IllegalArgumentException(
        `Missing required config for step '${currentStep.name}' of type '${type}'`
      );
    }

    validateSchema(
      ajv,
      executor.configDefinition as Schema,
      config,
      `step '${currentStep.name}' config validation`
    );
  }

  if (inputTransformer) {
    executionData = applyInputTransformer(
      currentStep.name,
      inputTransformer,
      executionData,
      visitedSteps
    );
  }

  if (inputDefinition) {
    const schema = getUserDefinition(
      inputWorkflowDefinition,
      inputDefinition.$ref
    );
    const userInput = generateDataFromSchema(
      schema,
      inputTransformer,
      executionData
    );
    validateSchema(
      ajv,
      schema,
      userInput,
      `step '${currentStep.name}' input validation`
    );
    executionData[`${currentStep.name}Input`] = userInput;
  }

  if (outputDefinition) {
    const schema = getUserDefinition(
      inputWorkflowDefinition,
      outputDefinition.$ref
    );
    const userOutput = generateDataFromSchema(schema);
    validateSchema(
      ajv,
      schema,
      userOutput,
      `step '${currentStep.name}' output validation`
    );
    executionData[`${currentStep.name}Output`] = userOutput;
  }

  if (currentStep.transitionToStep) {
    const nextSteps = getNextSteps(currentStep.transitionToStep);
    for (const nextStepName of nextSteps) {
      const nextStep = getStepByName(inputWorkflowDefinition, nextStepName);
      traverseSteps(
        inputWorkflowDefinition,
        ajv,
        stepExecutors,
        nextStep,
        { ...executionData },
        new Array(...visitedSteps)
      );
    }
  }
}

export function performAnalysisOnTypes(
  inputWorkflowDefinition: JustWorkflowItWorkflowDefinition,
  ajv: Ajv,
  stepExecutors: Array<StepExecutor>
): void {
  if (
    !inputWorkflowDefinition.steps ||
    inputWorkflowDefinition.steps.length === 0
  ) {
    throw new Error('Workflow has no steps defined.');
  }

  Object.entries(inputWorkflowDefinition.definitions).forEach(([key, def]) => {
    JSONSchemaFaker.define(key, def as unknown as JSONSchemaFakerDefine);
  });

  traverseSteps(
    inputWorkflowDefinition,
    ajv,
    stepExecutors,
    inputWorkflowDefinition.steps[0],
    {},
    []
  );
}
