import WorkflowState from './workflowState';

interface StepExecutor {
  type: string;
  execute(currentWorkflowState: WorkflowState): any; // TODO: let's not be any
}

export default StepExecutor;
