import { JustWorkflowItEngine } from '../src';
import {
  StepExecutor,
  StepExecutorArguments,
} from '../src/engine/stepExecutor';
import { SampleEngineRunner } from '../src/samples/sampleEngineRunner';
import { WorkflowDefinition } from '../src/workflowDefinition/types';
import WorkflowState from '../src/engine/workflowState';

describe('Workflow Engine Test Cases with Retries', () => {
  test('step executor retries on failure and succeeds', () => {
    const simpleIntegration = 'bdIntegration';

    let executionAttempts = 0;
    const outputAPropertyKey = 'outputAPropertyKey';
    const outputA = {
      [outputAPropertyKey]: 'anOutputProperty',
    };

    const firstFailThenSucceedStepExecutor: StepExecutor = {
      type: simpleIntegration,
      execute: (_args: StepExecutorArguments): Record<string, unknown> => {
        if (executionAttempts === 0) {
          executionAttempts += 1;
          throw new Error('Step execution failed on first attempt.');
        }
        executionAttempts += 1;
        return outputA;
      },
    };

    const workflowDefinition: WorkflowDefinition = {
      workflowName: 'retryWorkflow',
      steps: [
        {
          name: 'failingStep',
          retries: 1,
          timeoutSeconds: 1000,
          transitionToStep: null,
          integrationDetails: {
            type: simpleIntegration,
            parameterDefinition: {
              $ref: '#/definitions/failingStepParameters',
            },
            resultDefinition: {
              $ref: '#/definitions/failingStepResults',
            },
          },
        },
      ],
      definitions: {
        failingStepParameters: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
        failingStepResults: {
          type: 'object',
          properties: {
            [outputAPropertyKey]: {
              type: 'string',
            },
          },
          required: [outputAPropertyKey],
          additionalProperties: false,
        },
      },
    };

    const engine = new JustWorkflowItEngine({
      workflowDefinition: JSON.stringify(workflowDefinition),
      stepExecutors: [firstFailThenSucceedStepExecutor],
    });

    const initialWorkflowState: WorkflowState = {
      nextStepName: workflowDefinition.steps[0]!.name,
      userSpace: {},
      executionHistory: [],
    };

    const sampleEngineRunner = new SampleEngineRunner(
      engine,
      initialWorkflowState
    );
    sampleEngineRunner.runUntilTerminalStep();

    expect(executionAttempts).toBe(2);
    expect(sampleEngineRunner.getCurrentWorkflowState().nextStepName).toBe(
      null
    );
    expect(
      sampleEngineRunner.getCurrentWorkflowState().userSpace
    ).toMatchObject({
      failingStepParameters: undefined,
      failingStepResult: {
        outputAPropertyKey: 'anOutputProperty',
      },
    });
  });
});
