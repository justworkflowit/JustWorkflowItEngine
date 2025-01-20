export interface ExecutionHistoryItem {
  id: string;
  stepName: string;
  stepExecutorType: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown> | null;
  status: 'success' | 'failure';
  /**
   *  ISO 8601 format date string when step execution started
   */
  startTimestamp: string;
  /**
   *  ISO 8601 format date string when step execution ended
   */
  endTimestamp: string;
  /**
   * Optional error message in case of failure
   */
  error?: string;
}
