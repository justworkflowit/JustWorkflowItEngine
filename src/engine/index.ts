import { v4 as uuidv4 } from 'uuid';
import { IllegalArgumentException, IllegalStateException } from '../exceptions';
import { StepExecutor, StepExecutorIntegrationDetails } from './stepExecutor';
import WorkflowState from './workflowState';
import validateAndGetWorkflowDefinition from '../workflowDefinition';
import {
  StepDefinition,
  WorkflowDefinition,
} from '../workflowDefinition/types';
import { ExecutionHistoryItem } from './executionHistoryItem';

const xform = require('@perpk/json-xform');

const { mapToNewObject } = xform;

interface JustWorkflowItEngineConstructorArgs {
  workflowDefinition: string;
  stepExecutors: Array<StepExecutor>;
}

class JustWorkflowItEngine {
  workflowDefinition: WorkflowDefinition;

  stepExecutors: Array<StepExecutor>;

  constructor(constructorArgs: JustWorkflowItEngineConstructorArgs) {
    this.workflowDefinition = validateAndGetWorkflowDefinition(
      constructorArgs.workflowDefinition
    );
    this.stepExecutors = constructorArgs.stepExecutors;
  }

  public getStepUnderExecution(
    currentWorkflowState: WorkflowState
  ): StepDefinition {
    if (currentWorkflowState.nextStepName === null) {
      throw new IllegalStateException(
        'Workflow State indicates that workflow has run to completion, no steps left to execute.'
      );
    }

    return this.workflowDefinition.steps.filter(
      (step) => step.name === currentWorkflowState.nextStepName
    )[0];
  }

  public async executeNextStep(
    currentWorkflowState: WorkflowState
  ): Promise<WorkflowState> {
    const stepToExecuteDefinition =
      this.getStepUnderExecution(currentWorkflowState);

    if (!stepToExecuteDefinition) {
      throw new IllegalArgumentException(
        `Step named '${currentWorkflowState.nextStepName}' not found in workflow definition '${this.workflowDefinition.workflowName}'`
      );
    }

    const { parameterTransformer, ...restOfIntegrationDetails } =
      stepToExecuteDefinition.integrationDetails;

    // Extract parameters from current workflow definition and workflow state using xform
    let userParameters;

    if (parameterTransformer) {
      try {
        userParameters = mapToNewObject(
          currentWorkflowState,
          parameterTransformer
        );
      } catch (e) {
        throw new IllegalArgumentException(
          `Unable to parse user parameters. Exception: ${e}`
        );
      }
    }

    // Find executor for the current step
    const currentStepExecutorType =
      stepToExecuteDefinition.integrationDetails.type;
    const currentStepExecutor = this.stepExecutors.filter(
      (stepExecutor) => stepExecutor.type === currentStepExecutorType
    )[0];
    if (!currentStepExecutor) {
      throw new IllegalArgumentException(
        `Expected to find step executor of type '${currentStepExecutorType}', not found.`
      );
    }

    const stepIntegrationDetails: StepExecutorIntegrationDetails = {
      ...restOfIntegrationDetails,
    };

    // Execute the current step executor using the current workflow state
    let stepResult;
    let status: 'success' | 'failure' = 'success';
    let error: string | undefined;
    const startTimestamp = new Date().toISOString();

    try {
      stepResult = await currentStepExecutor.execute({
        integrationDetails: stepIntegrationDetails,
        parameters: userParameters,
      });
    } catch (e) {
      stepResult = null;
      status = 'failure';
      error = String(e);
    }

    const endTimestamp = new Date().toISOString();

    const newExecutionHistoryItem: ExecutionHistoryItem = {
      id: uuidv4(),
      stepName: stepToExecuteDefinition.name,
      stepExecutorType: stepToExecuteDefinition.integrationDetails.type,
      parameters: userParameters,
      result: stepResult,
      status,
      startTimestamp,
      endTimestamp,
      error,
    };

    // If the step under execution fails, do not advance the next step to run
    const nextStepName: string =
      newExecutionHistoryItem.status === 'success'
        ? (stepToExecuteDefinition.transitionToStep as string)
        : stepToExecuteDefinition.name;

    const newWorkflowState: WorkflowState = {
      ...currentWorkflowState,
      executionData: {
        ...currentWorkflowState.executionData,
        [`${stepToExecuteDefinition.name}Parameters`]: userParameters,
        [`${stepToExecuteDefinition.name}Result`]: stepResult,
      },
      nextStepName,
      executionHistory: [
        ...currentWorkflowState.executionHistory,
        newExecutionHistoryItem,
      ],
    };

    return newWorkflowState;
  }
}

export default JustWorkflowItEngine;
