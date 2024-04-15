import WorkflowState from '../workflowState';

interface StepExecutor {
  type: string;
  execute(currentWorkflowState: WorkflowState): WorkflowState;
}

export default StepExecutor;
