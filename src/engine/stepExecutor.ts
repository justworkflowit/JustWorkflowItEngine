import { IntegrationDetails } from '../workflowDefinition';

export type StepExecutorIntegrationDetails = Omit<
  IntegrationDetails,
  'parameters'
>;

interface StepExecutor {
  type: string;
  execute(
    integrationDetails: StepExecutorIntegrationDetails,
    userParameters: unknown
  ): unknown;
}

export default StepExecutor;
