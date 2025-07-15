import fs from 'fs';
import path from 'path';
import { expectedErrors } from './typeAnalysis/expectedErrors';
import { JustWorkflowItEngine } from '../src';
import {
  StepExecutor,
  StepExecutorArguments,
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
  // TODO: let's type the step executor, let the user provide unknown if needed
  type: simpleIntegration,
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve(outputA),
};

const stepExecutorB: StepExecutor = {
  // TODO: let's type the step executor, let the user provide unknown if needed
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

  const positiveTestCasesDirOne = path.join(
    __dirname,
    'workflowTestCases/positive'
  );
  const positiveTestCasesDirTwo = path.join(
    __dirname,
    'typeAnalysis/typeAnalysisWorkflowTestCases/positive'
  );
  const negativeTestCasesDirOne = path.join(
    __dirname,
    'workflowTestCases/negative'
  );
  const negativeTestCasesDirTwo = path.join(
    __dirname,
    'typeAnalysis/typeAnalysisWorkflowTestCases/negative'
  );

  const positiveTestCaseFiles = [
    ...fs
      .readdirSync(positiveTestCasesDirOne)
      .map((file) => path.join(positiveTestCasesDirOne, file)),
    ...fs
      .readdirSync(positiveTestCasesDirTwo)
      .map((file) => path.join(positiveTestCasesDirTwo, file)),
  ].filter((file) => path.extname(file) === '.json');

  const negativeTestCaseFiles = [
    ...fs
      .readdirSync(negativeTestCasesDirOne)
      .map((file) => path.join(negativeTestCasesDirOne, file)),
    ...fs
      .readdirSync(negativeTestCasesDirTwo)
      .map((file) => path.join(negativeTestCasesDirTwo, file)),
  ].filter((file) => path.extname(file) === '.json');

  // Positive Workflow Execution Tests
  test.each(positiveTestCaseFiles)(
    'run workflow test case: %s',
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

  // Map of expected errors for negative test cases
  const expectedErrorsOverride: Record<string, string> = {
    'empty.json':
      '[{"instancePath":"","schemaPath":"#/required","keyword":"required","params":{"missingProperty":"workflowName"},"message":"must have required property \'workflowName\'"}]',
  };

  // Negative Workflow Definition Tests
  test.each(negativeTestCaseFiles)(
    'validate workflow definition: %s',
    (filePath) => {
      const workflowDefinition: JustWorkflowItWorkflowDefinition = JSON.parse(
        fs.readFileSync(filePath, 'utf-8')
      );

      const consolidatedExpectedErrors = {
        ...expectedErrors,
        ...expectedErrorsOverride,
      };
      const expectedError = consolidatedExpectedErrors[path.basename(filePath)];
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
