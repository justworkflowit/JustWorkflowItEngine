import JustWorkflowItEngine from '../engine';
import { ExecutionHistoryItem } from '../engine/executionHistoryItem';
import WorkflowState from '../engine/workflowState';

export class SampleEngineRunner {
  private engine: JustWorkflowItEngine;

  private currentWorkflowState: WorkflowState;

  constructor(engine: JustWorkflowItEngine, initialState: WorkflowState) {
    this.engine = engine;
    this.currentWorkflowState = initialState;
  }

  public async runUntilTerminalStep(): Promise<void> {
    let runAttempts = 0;

    while (this.currentWorkflowState.nextStepName) {
      this.currentWorkflowState = await this.engine.executeNextStep(
        this.currentWorkflowState
      );

      const lastExecution: ExecutionHistoryItem =
        this.currentWorkflowState.executionHistory[
          this.currentWorkflowState.executionHistory.length - 1
        ];

      // if a step fails and retries are available, attempt a retry
      if (lastExecution.output.status === 'failure') {
        const stepUnderExecution = this.engine.getStepUnderExecution(
          this.currentWorkflowState
        );
        if (
          stepUnderExecution.retries &&
          stepUnderExecution.retries > runAttempts
        ) {
          runAttempts += 1;
          continue;
        } else {
          console.error(
            `Step execution failed: ${lastExecution.errors.join(', ')}`
          );
          break;
        }
      }

      runAttempts = 0; // Reset run attempts for the next step
    }
  }

  public getCurrentWorkflowState(): WorkflowState {
    return this.currentWorkflowState;
  }
}
