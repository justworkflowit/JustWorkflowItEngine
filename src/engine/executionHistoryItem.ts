export interface ExecutionHistoryItem {
  id: string;
  stepName: string;
  stepExecutorType: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: 'success' | 'failure';
  historySource: 'engine' | 'external';
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
