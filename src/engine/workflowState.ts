import { ExecutionHistoryItem } from './executionHistoryItem';

interface WorkflowState {
  nextStepName: string | null;
  userSpace: {
    [key: string]: any;
  };
  executionHistory: ExecutionHistoryItem[];
}

export default WorkflowState;
