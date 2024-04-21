import { IntegrationDetails } from '../workflowDefinition';

export type StepExecutorIntegrationDetails = Omit<
  IntegrationDetails,
  'parameters'
>;

export interface StepExecutorArguments {
  integrationDetails: StepExecutorIntegrationDetails;
  parameters: unknown;
}

interface StepExecutor {
  type: string;
  execute(args: StepExecutorArguments): Record<string, unknown>;
}

export default StepExecutor;
