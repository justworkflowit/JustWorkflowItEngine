import WorkflowState from '../workflowState';

interface StepExecutor {
  type: string;
  execute(
    currentWorkflowState: WorkflowState,
    userParameters: any
  ): WorkflowState;
}

export default StepExecutor;
