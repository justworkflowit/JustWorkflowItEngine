import fs from 'fs';
import path from 'path';
import { JustWorkflowItEngine } from '../src';
import {
  StepExecutor,
  StepExecutorArguments,
} from '../src/engine/stepExecutor';
import { WorkflowDefinition } from '../src/workflowDefinition/types';
import WorkflowState from '../src/engine/workflowState';
import { SampleEngineRunner } from '../src/samples/sampleEngineRunner';

const simpleIntegration = 'simpleIntegration';

const outputAPropertyKey = 'outputPropertyA';
const outputA = {
  [outputAPropertyKey]: 'anOutputPropertyValue',
};

const stepExecutorA: StepExecutor = {
  // TODO: let's type the step executor, let the user provide unknown if needed
  type: simpleIntegration,
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve(outputA),
};

const step1Name = 'firstStep';
const step2Name = 'secondStep';
const step1InputName = `${step1Name}Input`;
const step1OutputName = `${step1Name}Output`;
const step2InputName = `${step2Name}Input`;
const step2OutputName = `${step2Name}Output`;
const aWorkflowDefinition: WorkflowDefinition = {
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
              withTemplate: 'a brand new field',
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

describe('Workflow Engine Test Cases', () => {
  test('run a basic workflow definition', async () => {
    const engine = new JustWorkflowItEngine({
      workflowDefinition: JSON.stringify(aWorkflowDefinition),
      stepExecutors: [stepExecutorA],
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

  const testCasesDir = path.join(__dirname, 'workflowTestCases');
  const files = fs
    .readdirSync(testCasesDir)
    .filter((file) => path.extname(file) === '.json');

  test.each(files)('run workflow test case: %s', async (file) => {
    const filePath = path.join(testCasesDir, file);
    const workflowDefinition = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const engine = new JustWorkflowItEngine({
      workflowDefinition: JSON.stringify(workflowDefinition),
      stepExecutors: [stepExecutorA],
    });

    const initialWorkflowState: WorkflowState = {
      nextStepName: workflowDefinition.steps[0]!.name,
      executionData: {},
      executionHistory: [],
    };

    const sampleEngineRunner = new SampleEngineRunner(
      engine,
      initialWorkflowState
    );

    await sampleEngineRunner.runUntilTerminalStep();

    expect(sampleEngineRunner.getCurrentWorkflowState().nextStepName).toBe(
      null
    );
  });
});
