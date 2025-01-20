import Ajv, { JSONSchemaType } from 'ajv';
import { DefinitionSchema, StepDefinition, WorkflowDefinition } from './types';
import { IllegalArgumentException } from '../exceptions';
import { nameof } from '../utils';

function getUserDefinition(
  workflowDefinition: WorkflowDefinition,
  $ref: string
): DefinitionSchema {
  if (!workflowDefinition.definitions) {
    throw new Error(
      `Expected '${nameof<WorkflowDefinition>('definitions')}' to be present`
    );
  }

  const matchingDefinitions: Array<string> = Object.keys(
    workflowDefinition.definitions
  ).filter(
    (definitionKey) => $ref.replace('#/definitions/', '') === definitionKey
  );

  if (matchingDefinitions.length !== 1) {
    throw new Error(
      `Expected exactly one reference to definition '${$ref}', found ${matchingDefinitions.length}`
    );
  }

  return workflowDefinition.definitions[matchingDefinitions[0]];
}

function getStepByName(
  workflowDefinition: WorkflowDefinition,
  stepName: string
): StepDefinition {
  const matchingSteps = workflowDefinition.steps.filter(
    (newStep) => newStep.name === stepName
  );

  if (matchingSteps.length !== 1) {
    throw new Error(
      `Expected exactly one step matching '${stepName}', found ${matchingSteps.length}`
    );
  }

  return matchingSteps[0];
}

export function performAnalysisOnTypes(
  inputWorkflowDefinition: WorkflowDefinition,
  ajv: Ajv
): void {
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
  let step = inputWorkflowDefinition.steps[0];
  while (step != null) {
    const userDefinition = getUserDefinition(
      inputWorkflowDefinition,
      step.integrationDetails.parameterDefinition.$ref
    );
    console.log(
      'TODO: walk through all parameter and output definitions using execution data to validate that all type definitions have been set up correctly',
      userDefinition
    );

    if (!step.transitionToStep) {
      break;
    }

    step = getStepByName(inputWorkflowDefinition, step.transitionToStep);
  }
}
