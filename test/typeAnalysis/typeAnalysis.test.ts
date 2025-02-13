import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import { JustWorkflowItWorkflowDefinition } from '../../src/workflowDefinition/types';
import { performAnalysisOnTypes } from '../../src/workflowDefinition/typeAnalysis';
import { expectedErrors } from './expectedErrors';

const ajv = new Ajv({ allowUnionTypes: true, strictTuples: false });
const testCasesDir = path.join(__dirname, 'typeAnalysisWorkflowTestCases');
const positiveTestCasesDir = path.join(testCasesDir, 'positive');
const negativeTestCasesDir = path.join(testCasesDir, 'negative');

const positiveFiles = fs
  .readdirSync(positiveTestCasesDir)
  .filter((file) => path.extname(file) === '.json');
const negativeFiles = fs
  .readdirSync(negativeTestCasesDir)
  .filter((file) => path.extname(file) === '.json');

describe('Workflow Definition Type Analysis - Positive Test Cases', () => {
  test.each(positiveFiles)('validate workflow definition: %s', (file) => {
    const filePath = path.join(positiveTestCasesDir, file);
    const workflowDefinition: JustWorkflowItWorkflowDefinition = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    );

    expect(() => performAnalysisOnTypes(workflowDefinition, ajv)).not.toThrow();
  });
});

describe('Workflow Definition Type Analysis - Negative Test Cases', () => {
  test.each(negativeFiles)('validate workflow definition: %s', (file) => {
    const filePath = path.join(negativeTestCasesDir, file);
    const workflowDefinition: JustWorkflowItWorkflowDefinition = JSON.parse(
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
