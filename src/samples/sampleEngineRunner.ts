import JustWorkflowItEngine from '../engine';
import WorkflowState from '../workflowState';

export class SampleEngineRunner {
  private engine: JustWorkflowItEngine;

  private currentWorkflowState: WorkflowState;

  constructor(engine: JustWorkflowItEngine, initialState: WorkflowState) {
    this.engine = engine;
    this.currentWorkflowState = initialState;
  }

  public runUntilTerminalStep(): void {
    let runAttempts = 0;

    while (this.currentWorkflowState.nextStepName) {
      try {
        this.currentWorkflowState = this.engine.executeNextStep(
          this.currentWorkflowState
        );
      } catch (error) {
        const stepUnderExecution = this.engine.getStepUnderExecution(
          this.currentWorkflowState
        );
        if (
          stepUnderExecution.retries &&
          stepUnderExecution.retries >= runAttempts
        ) {
          runAttempts += 1;
          continue;
        }

        throw error;
      }
    }
  }

  public getCurrentWorkflowState(): WorkflowState {
    return this.currentWorkflowState;
  }
}
