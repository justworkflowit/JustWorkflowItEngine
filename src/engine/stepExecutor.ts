import { IntegrationDetails } from '../workflowDefinition/types';

export type StepExecutorIntegrationDetails = Omit<
  IntegrationDetails,
  'parameterTransformer'
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
