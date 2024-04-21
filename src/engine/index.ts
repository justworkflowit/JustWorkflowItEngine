import { IllegalArgumentException } from '../exceptions';
import StepExecutor from './stepExecutor';
import WorkflowState from '../workflowState';
import validateAndGetWorkflowDefinition, {
  WorkflowDefinition,
} from '../workflowDefinition';

const xform = require('@perpk/json-xform');

const { mapToNewObject } = xform;

interface JustWorkflowItEngineConstructorArgs {
  workflowDefinition: string;
  stepExecutors: Array<StepExecutor>;
}

class JustWorkflowItEngine {
  workflowDefinition: WorkflowDefinition;

  stepExecutors: Array<StepExecutor>;

  constructor(constructorArgs: JustWorkflowItEngineConstructorArgs) {
    this.workflowDefinition = validateAndGetWorkflowDefinition(
      constructorArgs.workflowDefinition
    );
    this.stepExecutors = constructorArgs.stepExecutors;
  }

  public executeNextStep(currentWorkflowState: WorkflowState): WorkflowState {
    // Get current step
    const currentStepDefinition = this.workflowDefinition.steps.filter(
      (step) => step.name === currentWorkflowState.nextStepName
    )[0];

    if (!currentStepDefinition) {
      throw new IllegalArgumentException(
        `Step named '${currentWorkflowState.nextStepName}' not found in workflow definition '${this.workflowDefinition.workflowName}'`
      );
    }

    // Extract parameters from current workflow definition and workflow state using xform
    let userParameters;

    try {
      userParameters = mapToNewObject(
        currentWorkflowState,
        currentStepDefinition.integrationDetails.parameters
      );
    } catch (e) {
      throw new IllegalArgumentException(
        `Unable to parse user parameters. Exception: ${e}`
      );
    }

    // Find executor for the current step
    const currentStepExecutorType =
      currentStepDefinition.integrationDetails.type;
    const currentStepExecutor = this.stepExecutors.filter(
      (stepExecutor) => stepExecutor.type === currentStepExecutorType
    )[0];
    if (!currentStepExecutor) {
      throw new IllegalArgumentException(
        `Expected to find step executor of type '${currentStepExecutorType}', not found.`
      );
    }

    // Execute the current step executor using the current workflow state
    const stepOutput = currentStepExecutor.execute(
      currentWorkflowState,
      userParameters
    ); // TODO: let's not pass the entire state, maybe just integration details and userParameters
    const newWorkflowState: WorkflowState = {
      ...currentWorkflowState,
      userSpace: {
        ...currentWorkflowState.userSpace,
        ...stepOutput,
      },
      nextStepName: currentStepDefinition.transitionToStep,
    };

    return newWorkflowState;
  }
}

export default JustWorkflowItEngine;
