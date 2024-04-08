import WorkflowDefinition from './workflowDefinition';
import WorkflowState from './workflowState';

class JustWorkflowItEngine {
  workflowDefinition: WorkflowDefinition;

  constructor(workflowDefinition: WorkflowDefinition) {
    this.workflowDefinition = workflowDefinition;
  }

  public static executeNextStep(workflowState: WorkflowState): void {
  }
}

export default JustWorkflowItEngine;
