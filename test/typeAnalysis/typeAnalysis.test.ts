import fs from 'fs';
import path from 'path';
import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import { getAjv } from '../../src/workflowDefinition/ajvInitialize';
import { JustWorkflowItWorkflowDefinition } from '../../src/workflowDefinition/types';
import { performAnalysisOnTypes } from '../../src/workflowDefinition/typeAnalysis';
import { expectedErrors } from './expectedErrors';
import {
  StepExecutor,
  StepExecutorArguments,
} from '../../src/engine/stepExecutor';

const ajv = getAjv();

const testCasesDir = path.join(__dirname, 'typeAnalysisWorkflowTestCases');
const positiveTestCasesDir = path.join(testCasesDir, 'positive');
const negativeTestCasesDir = path.join(testCasesDir, 'negative');

const positiveFiles = fs
  .readdirSync(positiveTestCasesDir)
  .filter((file) => path.extname(file) === '.json');
const negativeFiles = fs
  .readdirSync(negativeTestCasesDir)
  .filter((file) => path.extname(file) === '.json');

const stepExecutorA: StepExecutor = {
  // TODO: let's type the step executor, let the user provide unknown if needed
  type: 'simpleIntegration',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({}),
};

const stepExecutorB: StepExecutor = {
  // TODO: let's type the step executor, let the user provide unknown if needed
  type: 'noopIntegration',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({}),
};

const stepExecutors = [stepExecutorA, stepExecutorB];

describe('Workflow Definition Type Analysis - Positive Test Cases', () => {
  test.each(positiveFiles)('validate workflow definition: %s', (file) => {
    const filePath = path.join(positiveTestCasesDir, file);
    const workflowDefinition: JustWorkflowItWorkflowDefinition = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    ) as JustWorkflowItWorkflowDefinition;

    let workflowInput;
    if (workflowDefinition?.definitions?.workflowInput) {
      workflowInput = JSONSchemaFaker.generate(
        workflowDefinition.definitions.workflowInput as Schema
      );
    }

    expect(() =>
      performAnalysisOnTypes(
        workflowDefinition,
        ajv,
        stepExecutors,
        workflowInput
      )
    ).not.toThrow();
  });
});

describe('Workflow Definition Type Analysis - Negative Test Cases', () => {
  test.each(negativeFiles)('validate workflow definition: %s', (file) => {
    const filePath = path.join(negativeTestCasesDir, file);
    const workflowDefinition: JustWorkflowItWorkflowDefinition = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    ) as JustWorkflowItWorkflowDefinition;

    let workflowInput;
    if (workflowDefinition?.definitions?.workflowInput) {
      workflowInput = JSONSchemaFaker.generate(
        workflowDefinition.definitions.workflowInput as Schema
      );
    }

    const expectedError = expectedErrors[file];
    if (!expectedError) {
      throw new Error(`No expected error found for test case file: ${file}`);
    }

    expect(() => {
      performAnalysisOnTypes(
        workflowDefinition,
        ajv,
        stepExecutors,
        workflowInput
      );
    }).toThrow(expectedError);
  });
});
