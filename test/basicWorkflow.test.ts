import JustWorkflowItEngine from '../src';
import StepExecutor, {
  StepExecutorArguments,
} from '../src/engine/stepExecutor';
import { WorkflowDefinition } from '../src/workflowDefinition';
import WorkflowState from '../src/workflowState';

const integrationTypeA = 'integrationTypeA';

const outputAPropertyKey = 'outputAPropertyKey';
const outputA = {
  [outputAPropertyKey]: 'anOutputProperty',
};

const stepExecutorA: StepExecutor = {
  // TODO: let's type the step executor, let the user provide unknown if needed
  type: integrationTypeA,
  execute: (args: StepExecutorArguments): Record<string, unknown> => {
    console.log(
      'Hello world, Naush!',
      args.integrationDetails,
      args.parameters
    );
    return outputA;
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
      transitionToStep: step2Name,
      integrationDetails: {
        type: integrationTypeA,
        parameters: {
          fieldset: [
            {
              to: 'newPropA',
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
      transitionToStep: null, // TODO: set this to null
      integrationDetails: {
        type: integrationTypeA,
        parameters: {
          fieldset: [
            {
              from: `${step1Name}Result.${outputAPropertyKey}`,
              to: 'newPropB',
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

  currentWorkflowState = engine.executeNextStep(currentWorkflowState);
  expect(currentWorkflowState.nextStepName).toBe(null);
});
