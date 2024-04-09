import { IllegalArgumentException } from './exceptions';
import StepExecutor from './stepExecutor';
import WorkflowDefinition from './workflowDefinition';
import WorkflowState from './workflowState';

class JustWorkflowItEngine {
  workflowDefinition: WorkflowDefinition;

  stepExecutors: Array<StepExecutor>;

  constructor(
    workflowDefinition: WorkflowDefinition,
    stepExecutors: Array<StepExecutor>
  ) {
    this.workflowDefinition = workflowDefinition;
    this.stepExecutors = stepExecutors;
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

    // TODO: Extract parameters from current workflow definition and workflow state using xform
    // TODO: Validate that the parameters exist

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
    const stepOutput = currentStepExecutor.execute(currentWorkflowState); // TODO: let's not pass the entire state
    const newWorkflowState: WorkflowState = {
      ...currentWorkflowState,
      userspace: {
        ...currentWorkflowState.userspace,
        ...stepOutput,
      },
      nextStepName: currentStepDefinition.transitionToStepName,
    };

    return newWorkflowState;
  }
}

export default JustWorkflowItEngine;
