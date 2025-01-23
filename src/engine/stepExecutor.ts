import { IntegrationDetails } from '../workflowDefinition/types';

export type StepExecutorIntegrationDetails = Omit<
  IntegrationDetails,
  'inputTransformer'
>;

export interface StepExecutorArguments {
  integrationDetails: StepExecutorIntegrationDetails;
  input: unknown;
}

export interface StepExecutor {
  type: string;
  execute(args: StepExecutorArguments): Promise<Record<string, unknown>>;
}
