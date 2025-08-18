import fs from 'fs';
import path from 'path';
import { expectedErrors } from './typeAnalysis/expectedErrors';
import { JustWorkflowItEngine } from '../src';
import {
  StepExecutor,
  StepExecutorArguments,
  StepExecutorOutput,
} from '../src/engine/stepExecutor';
import { JustWorkflowItWorkflowDefinition } from '../src/workflowDefinition/types';
import WorkflowState from '../src/engine/workflowState';
import { SampleEngineRunner } from '../src/samples/sampleEngineRunner';

const simpleIntegration = 'simpleIntegration';

const outputAPropertyKey = 'outputPropertyA';
const outputA = {
  [outputAPropertyKey]: 'anOutputPropertyValue',
};

const stepExecutorA: StepExecutor = {
  type: simpleIntegration,
  configDefinition: {
    type: 'object',
    required: ['env', 'token'],
    additionalProperties: false,
    properties: {
      env: { type: 'string' },
      token: { type: 'string' },
    },
  },
  execute: (_args: StepExecutorArguments): Promise<StepExecutorOutput> =>
    Promise.resolve({
      status: 'success',
      payload: outputA,
    }),
};

const stepExecutorB: StepExecutor = {
  type: 'noopIntegration',
  execute: (_args: StepExecutorArguments): Promise<StepExecutorOutput> =>
    Promise.resolve({
      status: 'success',
      payload: {},
    }),
};

const stepExecutors = [stepExecutorA, stepExecutorB];

const step1Name = 'firstStep';
const step2Name = 'secondStep';
const step1InputName = `${step1Name}Input`;
const step1OutputName = `${step1Name}Output`;
const step2InputName = `${step2Name}Input`;
const step2OutputName = `${step2Name}Output`;

const validConfig = {
  env: 'dev',
  token: 'abcdefghijklmnop',
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
        config: validConfig,
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
        config: validConfig,
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

describe('Config Definition Workflow Test Cases', () => {
  test('run a static-configured workflow definition', async () => {
    const engine = new JustWorkflowItEngine({
      workflowDefinition: JSON.stringify(aWorkflowDefinition),
      stepExecutors,
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

  const configPositiveDir = path.join(
    __dirname,
    'workflowTestCases/config/positive'
  );
  const configNegativeDir = path.join(
    __dirname,
    'workflowTestCases/config/negative'
  );

  const positiveTestCaseFiles = fs
    .readdirSync(configPositiveDir)
    .map((file) => path.join(configPositiveDir, file))
    .filter((file) => path.extname(file) === '.json');

  const negativeTestCaseFiles = fs
    .readdirSync(configNegativeDir)
    .map((file) => path.join(configNegativeDir, file))
    .filter((file) => path.extname(file) === '.json');

  test.each(positiveTestCaseFiles)(
    'run config validation test case: %s',
    async (filePath) => {
      const workflowDefinition = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const engine = new JustWorkflowItEngine({
        workflowDefinition: JSON.stringify(workflowDefinition),
        stepExecutors,
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
    }
  );

  test.each(negativeTestCaseFiles)(
    'validate config definition failure: %s',
    (filePath) => {
      const workflowDefinition: JustWorkflowItWorkflowDefinition = JSON.parse(
        fs.readFileSync(filePath, 'utf-8')
      );

      const expectedError = expectedErrors[path.basename(filePath)];
      if (!expectedError) {
        throw new Error(
          `No expected error found for test case file: ${filePath}`
        );
      }

      expect(() => {
        // eslint-disable-next-line no-new
        new JustWorkflowItEngine({
          workflowDefinition: JSON.stringify(workflowDefinition),
          stepExecutors,
        });
      }).toThrow(expectedError);
    }
  );
});
