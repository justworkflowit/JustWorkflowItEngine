import { ExecutionHistoryItem } from './executionHistoryItem';

interface WorkflowState {
  nextStepName: string | null;
  executionData: {
    [key: string]: any;
  };
  executionHistory: ExecutionHistoryItem[];
}

export default WorkflowState;
