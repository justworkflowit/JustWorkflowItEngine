import JustWorkflowItEngine from '../src';
import StepExecutor, {
  StepExecutorIntegrationDetails,
} from '../src/engine/stepExecutor';
import { WorkflowDefinition } from '../src/workflowDefinition';
import WorkflowState from '../src/workflowState';

const integrationTypeA = 'integrationTypeA';
const anOutput = {
  anOutputPropertyKey: 'anOutputProperty',
};

const stepExecutorA: StepExecutor = {
  // TODO: let's type the step executor, let the user provide unknown if needed
  type: integrationTypeA,
  execute: (
    integrationDetails: StepExecutorIntegrationDetails,
    userParameters: unknown
  ): unknown => {
    console.log('Hello world, Naush!', integrationDetails, userParameters);
    return anOutput;
  },
};

const step1Name = 'firstStep';
const step2Name = 'secondStep';

const aWorkflowDefinition: WorkflowDefinition = {
  workflowName: 'aWorkflowDefinition',
  steps: [
    {
      name: step1Name,
      retries: 2,
      timeoutSeconds: 1000,
      transitionToStep: 'secondStep',
      integrationDetails: {
        type: integrationTypeA,
        parameters: {
          fieldset: [
            {
              to: 'newProp',
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
      transitionToStep: 'secondStep',
      integrationDetails: {
        type: integrationTypeA,
        parameters: {
          fieldset: [
            {
              to: 'newProp',
              withTemplate: 'a brand new field',
            },
          ],
        },
      },
    },
  ],
};

test('run a basic workflow definition', () => {
  const engine = new JustWorkflowItEngine({
    workflowDefinition: JSON.stringify(aWorkflowDefinition),
    stepExecutors: [stepExecutorA],
  });

  let currentWorkflowState: WorkflowState = {
    nextStepName: 'firstStep', // TODO: should this be automated. Maybe in the class constructor definition
    userSpace: {},
  };

  currentWorkflowState = engine.executeNextStep(currentWorkflowState);
  expect(currentWorkflowState.nextStepName).toBe(step2Name);
});
