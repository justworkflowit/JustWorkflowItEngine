import { IllegalArgumentException, JustWorkflowItEngine } from '../src';
import {
  StepExecutor,
  StepExecutorArguments,
} from '../src/engine/stepExecutor';
import { JustWorkflowItWorkflowDefinition } from '../src/workflowDefinition/types';
import WorkflowState from '../src/engine/workflowState';

const simpleIntegration = 'simpleIntegration';

const outputAPropertyKey = 'outputPropertyA';
const outputA = {
  [outputAPropertyKey]: 'anOutputPropertyValue',
};

const stepExecutorA: StepExecutor = {
  type: simpleIntegration,
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve(outputA),
};

const stepExecutorB: StepExecutor = {
  type: 'noopIntegration',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({}),
};

const stepExecutors = [stepExecutorA, stepExecutorB];

const step1Name = 'firstStep';
const step2Name = 'secondStep';
const step1InputName = `${step1Name}Input`;
const step1OutputName = `${step1Name}Output`;
const step2InputName = `${step2Name}Input`;
const step2OutputName = `${step2Name}Output`;

const workflowInput = {
  workflowInputPropertyA: 'testing123',
};

const aWorkflowDefinition: JustWorkflowItWorkflowDefinition = {
  workflowName: 'aWorkflowDefinition',
  steps: [
    {
      name: step1Name,
      retries: 2,
      timeoutSeconds: 1000,
      transitionToStep: step2Name,
      integrationDetails: {
        type: simpleIntegration,
        inputDefinition: {
          $ref: `#/definitions/${step1InputName}`,
        },
        outputDefinition: {
          $ref: `#/definitions/${step1OutputName}`,
        },
        inputTransformer: {
          fieldset: [
            {
              to: 'inputPropertyA',
              from: 'workflowInput.workflowInputPropertyA',
            },
          ],
        },
      },
    },
    {
      name: step2Name,
      retries: 2,
      timeoutSeconds: 1000,
      transitionToStep: null,
      integrationDetails: {
        type: simpleIntegration,
        inputDefinition: {
          $ref: `#/definitions/${step2InputName}`,
        },
        outputDefinition: {
          $ref: `#/definitions/${step2OutputName}`,
        },
        inputTransformer: {
          fieldset: [
            {
              from: `${step1Name}Output.${outputAPropertyKey}`,
              to: 'inputPropertyB',
            },
          ],
        },
      },
    },
  ],
  definitions: {
    workflowInput: {
      type: 'object',
      properties: {
        workflowInputPropertyA: {
          type: 'string',
        },
      },
      required: ['workflowInputPropertyA'],
      additionalProperties: false,
    },
    [step1InputName]: {
      type: 'object',
      properties: {
        inputPropertyA: {
          type: 'string',
        },
      },
      required: ['inputPropertyA'],
      additionalProperties: false,
    },
    [step1OutputName]: {
      type: 'object',
      properties: {
        outputPropertyA: {
          type: 'string',
        },
      },
      required: ['outputPropertyA'],
      additionalProperties: false,
    },
    [step2InputName]: {
      type: 'object',
      properties: {
        inputPropertyB: {
          type: 'string',
        },
      },
      required: ['inputPropertyB'],
      additionalProperties: false,
    },
    [step2OutputName]: {
      type: 'object',
      properties: {
        outputPropertyB: {
          type: 'string',
        },
      },
      required: ['outputPropertyB'],
      additionalProperties: false,
    },
  },
};

describe('Workflow Input Test Cases', () => {
  test('run a valid workflow input enabled workflow definition', async () => {
    const engine = new JustWorkflowItEngine({
      workflowDefinition: JSON.stringify(aWorkflowDefinition),
      stepExecutors,
      workflowInput,
    });

    let currentWorkflowState: WorkflowState = {
      nextStepName: aWorkflowDefinition.steps[0]!.name,
      executionData: {},
      executionHistory: [],
    };

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.nextStepName).toBe(step2Name);

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.nextStepName).toBe(null);
  });

  test('missing workflow input for workflow input enabled workflow definition should throw', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new JustWorkflowItEngine({
        workflowDefinition: JSON.stringify(aWorkflowDefinition),
        stepExecutors,
      });
    }).toThrow(
      new IllegalArgumentException(
        'Workflow input value is required when a workflow input definition is provided'
      )
    );
  });

  test('workflow input for workflow input disabled workflow definition should throw', () => {
    expect(() => {
      const modifiedDefinition = JSON.parse(
        JSON.stringify(aWorkflowDefinition)
      ) as JustWorkflowItWorkflowDefinition;
      delete (modifiedDefinition.definitions as any).workflowInput;

      // eslint-disable-next-line no-new
      new JustWorkflowItEngine({
        workflowDefinition: JSON.stringify(modifiedDefinition),
        stepExecutors,
        workflowInput,
      });
    }).toThrow(
      new IllegalArgumentException(
        'Workflow input definition must be provided when a workflow input is provided'
      )
    );
  });

  test('workflow input mismatch to definition for workflow input enabled workflow definition should throw', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new JustWorkflowItEngine({
        workflowDefinition: JSON.stringify(aWorkflowDefinition),
        stepExecutors,
        workflowInput: {
          aDifferentProperty: 'test',
        },
      });
    }).toThrow(
      new IllegalArgumentException(
        'Validation failed workflowInput validation: [{"instancePath":"","schemaPath":"#/required","keyword":"required","params":{"missingProperty":"workflowInputPropertyA"},"message":"must have required property \'workflowInputPropertyA\'"}]. Used data \'{"aDifferentProperty":"test"}\''
      )
    );
  });
});
