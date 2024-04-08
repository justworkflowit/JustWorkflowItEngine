interface WorkflowDefinition {
  steps: Array<StepDefinition>
}

interface IntegrationDetails {
  type: 'aws:lambda' | 'aws:sns'
}

interface LambdaIntegrationDetails extends IntegrationDetails {}

interface SnsIntegrationDetails extends IntegrationDetails {}

interface StepDefinition {
  name: string
  definition: string
  integrationDetails: LambdaIntegrationDetails | SnsIntegrationDetails
}

export default WorkflowDefinition
