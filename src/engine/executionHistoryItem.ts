import { StepExecutorOutput } from './stepExecutor';

export interface ExecutionHistoryItem {
  id: string;
  stepName: string;
  stepExecutorType: string;
  input: Record<string, unknown>;
  output: StepExecutorOutput;
  historySource: 'engine' | 'external';
  /**
   * eventId for external events (e.g., child job ID for parent-child workflows)
   * Only present when historySource is 'external'
   */
  eventId?: string;
  /**
   *  ISO 8601 format date string when step execution started
   */
  startTimestamp: string;
  /**
   *  ISO 8601 format date string when step execution ended
   */
  endTimestamp: string;
  /**
   * Optional warning message(s) in execution
   */
  warnings: Array<string>;
  /**
   * Optional error message(s) in case of failure
   */
  errors: Array<string>;
}
