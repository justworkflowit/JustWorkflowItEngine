import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import { WorkflowDefinition } from '../../src/workflowDefinition/types';
import { performAnalysisOnTypes } from '../../src/workflowDefinition/typeAnalysis';

const ajv = new Ajv();
const testCasesDir = path.join(__dirname, 'typeAnalysisWorkflowTestCases');
const positiveTestCasesDir = path.join(testCasesDir, 'positive');
const negativeTestCasesDir = path.join(testCasesDir, 'negative');

const positiveFiles = fs
  .readdirSync(positiveTestCasesDir)
  .filter((file) => path.extname(file) === '.json');
const negativeFiles = fs
  .readdirSync(negativeTestCasesDir)
  .filter((file) => path.extname(file) === '.json');

// Map of expected errors for negative test cases
const expectedErrors: Record<string, string> = {
  'inconsistentDataTypes.json': 'must be number',
  'invalidParameterTransformer.json':
    "must have required property 'parameterB'",
  'invalidStepReference.json': "No step found with name 'nonExistentStep'",
  'missingDefinitions.json':
    "No definition found for reference '#/definitions/nonExistentParameters'",
  'missingRequiredProperty.json': "must have required property 'parameterB'",
};

describe('Workflow Definition Type Analysis - Positive Test Cases', () => {
  test.each(positiveFiles)('validate workflow definition: %s', (file) => {
    const filePath = path.join(positiveTestCasesDir, file);
    const workflowDefinition: WorkflowDefinition = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    );

    expect(() => performAnalysisOnTypes(workflowDefinition, ajv)).not.toThrow();
  });
});

describe('Workflow Definition Type Analysis - Negative Test Cases', () => {
  test.each(negativeFiles)('validate workflow definition: %s', (file) => {
    const filePath = path.join(negativeTestCasesDir, file);
    const workflowDefinition: WorkflowDefinition = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    );

    const expectedError = expectedErrors[file];
    if (!expectedError) {
      throw new Error(`No expected error found for test case file: ${file}`);
    }

    expect(() => {
      performAnalysisOnTypes(workflowDefinition, ajv);
    }).toThrow(expectedError);
  });
});
