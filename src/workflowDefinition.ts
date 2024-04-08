interface WorkflowDefinition {
  steps: Array<StepDefinition>;
}

interface IntegrationDetails {
  type: 'aws:lambda' | 'aws:sns' | 'marketplace';
}

interface LambdaIntegrationDetails extends IntegrationDetails {}

interface SnsIntegrationDetails extends IntegrationDetails {}

interface StepDefinition {
  name: string;
  retries: number;
  timeoutSeconds: number;
  integrationDetails: LambdaIntegrationDetails | SnsIntegrationDetails;
}

export default WorkflowDefinition;
