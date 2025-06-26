import {
  DefinitionSchema,
  IntegrationDetails,
} from '../workflowDefinition/types';

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
  configDefinition?: DefinitionSchema;
  execute(args: StepExecutorArguments): Promise<Record<string, unknown>>;
}
