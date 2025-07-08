/* eslint-disable prettier/prettier */
// Map of expected errors for negative test cases
export const expectedErrors: Record<string, string> = {
  'empty.json': 'Workflow has no steps defined.',
  'inconsistentDataTypes.json': 'must be number',
  'invalidInputTransformer.json':
    "Transformation error: Missing expected field 'firstStepOutput.nonExistentProperty' in execution data. The graph traversal path taken: firstStep -> secondStep",
  'invalidStepReference.json': "No step found with name 'nonExistentStep'",
  'missingDefinitions.json':
    "No definition found for reference '#/definitions/nonExistentInput'",
  'missingRequiredProperty.json':
    "Transformation error: Missing expected field 'firstStepOutput.nonExistentProperty' in execution data. The graph traversal path taken: firstStep -> secondStep",
  'invalidPropertyReferenceWorkflowInput.json':
    "Transformation error: Missing expected field 'workflowInput.missingProperty' in execution data. The graph traversal path taken: stepOne",
  'missingWorkflowInput.json':
    "No definition found for reference '#/definitions/workflowInput'",
  'invalidLogicResolution.json': "must have required property 'if'",
  'invalidWorkflowInputReferenceBasedOnPathLogic.json':
    "Transformation error: Missing expected field 'stepTwoOutput.someProperty' in execution data. The graph traversal path taken: stepOne -> stepThree",
  'invalidLogicReferenceToNonExistentStep.json':
    "No step found with name 'doesntExist'",
  'orLogicInvalidStep.json': "No step found with name 'invalidStep'",
  'invalidStepTypes.json':
    "No registered step executor found for type 'NonExistentSimpleIntegration'",
  'missingConfigProperty.json':
    'Validation failed step \'invalidStep\' config validation: [{"instancePath":"","schemaPath":"#/required","keyword":"required","params":{"missingProperty":"token"},"message":"must have required property \'token\'"}]. Used data \'{"env":"prod"}\'',
};
