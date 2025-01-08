import ParameterTransformerDefinition from './parameterTransformerTypes';

export interface IntegrationDetails {
  type: string;
  parameterTransformer?: ParameterTransformerDefinition;
  parameterDefinition: { $ref: string };
  resultDefinition: { $ref: string };
}

export interface StepDefinition {
  name: string;
  retries?: number;
  timeoutSeconds?: number;
  transitionToStep: string | null;
  integrationDetails: IntegrationDetails;
}

export interface JSONSchema {
  type?: string | string[];
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  $ref?: string;
}

export interface DefinitionsSchema {
  [key: string]: JSONSchema;
}

export interface WorkflowDefinition {
  workflowName: string;
  steps: Array<StepDefinition>;
  definitions: DefinitionsSchema;
}
