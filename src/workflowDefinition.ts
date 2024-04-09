interface WorkflowDefinition {
  workflowName: string;
  steps: Array<StepDefinition>;
}

interface IntegrationDetails {
  type: 'aws:lambda' | 'aws:sns';
  input: any; // TODO: type these better
  output: any; // TODO: type these better
}

interface LambdaIntegrationDetails extends IntegrationDetails {}

interface SnsIntegrationDetails extends IntegrationDetails {}

interface StepDefinition {
  name: string;
  retries: number;
  timeoutSeconds: number;
  integrationDetails: LambdaIntegrationDetails | SnsIntegrationDetails;
  transitionToStepName: string;
}

export default WorkflowDefinition;
