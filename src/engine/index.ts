import { v4 as uuidv4 } from 'uuid';
import jsonLogic, { AdditionalOperation, RulesLogic } from 'json-logic-js';
import { IllegalArgumentException, IllegalStateException } from '../exceptions';
import {
  StepExecutor,
  StepExecutorIntegrationDetails,
  StepExecutorOutput,
} from './stepExecutor';
import WorkflowState from './workflowState';
import validateAndGetWorkflowDefinition from '../workflowDefinition';
import {
  StepDefinition,
  JustWorkflowItWorkflowDefinition,
} from '../workflowDefinition/types';
import { ExecutionHistoryItem } from './executionHistoryItem';

interface JustWorkflowItEngineConstructorArgs {
  workflowDefinition: string;
  stepExecutors: Array<StepExecutor>;
  workflowInput?: Record<string, unknown>;
}

type ExecutionHistoryInput = Pick<
  ExecutionHistoryItem,
  | 'stepName'
  | 'stepExecutorType'
  | 'startTimestamp'
  | 'endTimestamp'
  | 'input'
  | 'output'
  | 'errors'
  | 'warnings'
>;

class JustWorkflowItEngine {
  workflowDefinition: JustWorkflowItWorkflowDefinition;

  stepExecutors: Array<StepExecutor>;

  workflowInput?: Record<string, unknown>;

  constructor(constructorArgs: JustWorkflowItEngineConstructorArgs) {
    this.stepExecutors = constructorArgs.stepExecutors;
    this.workflowInput = constructorArgs.workflowInput;
    // TODO validate workflow input type
    this.workflowDefinition = validateAndGetWorkflowDefinition(
      constructorArgs.workflowDefinition,
      this.stepExecutors,
      this.workflowInput
    );
  }

  public getStepUnderExecution(
    currentWorkflowState: WorkflowState
  ): StepDefinition {
    if (!currentWorkflowState.nextStepName) {
      throw new IllegalStateException(
        `Workflow State indicates that workflow has run to completion, no steps left to execute. ${JSON.stringify(currentWorkflowState, null, 2)}`
      );
    }

    const stepUnderExecution = this.workflowDefinition.steps.find(
      (step) => step.name === currentWorkflowState.nextStepName
    );

    if (!stepUnderExecution) {
      throw new IllegalStateException(
        'Workflow State points to a step that does not exist'
      );
    }

    return stepUnderExecution;
  }

  public async executeNextStep(
    currentWorkflowState: WorkflowState
  ): Promise<WorkflowState> {
    if (
      this.workflowInput &&
      !currentWorkflowState.executionData.workflowInput
    ) {
      // eslint-disable-next-line no-param-reassign
      currentWorkflowState.executionData.workflowInput = this.workflowInput;
    }

    const stepToExecuteDefinition =
      this.getStepUnderExecution(currentWorkflowState);

    if (!stepToExecuteDefinition) {
      throw new IllegalArgumentException(
        `Step named '${currentWorkflowState.nextStepName}' not found in workflow definition '${this.workflowDefinition.workflowName}'`
      );
    }

    const { inputTransformer, ...restOfIntegrationDetails } =
      stepToExecuteDefinition.integrationDetails;

    let userInput;
    if (inputTransformer) {
      try {
        // eslint-disable-next-line global-require
        const xform = require('@nkorai/json-xform');
        const { mapToNewObject } = xform;
        userInput = mapToNewObject(
          currentWorkflowState.executionData,
          inputTransformer
        );
      } catch (e) {
        throw new IllegalArgumentException(
          `Unable to parse user input. Exception: ${e}`
        );
      }
    }

    // Find executor for the current step
    const currentStepExecutorType =
      stepToExecuteDefinition.integrationDetails.type;
    const currentStepExecutor = this.stepExecutors.find(
      (stepExecutor) => stepExecutor.type === currentStepExecutorType
    );
    if (!currentStepExecutor) {
      throw new IllegalArgumentException(
        `Expected to find step executor of type '${currentStepExecutorType}', not found.`
      );
    }

    const stepIntegrationDetails: StepExecutorIntegrationDetails = {
      ...restOfIntegrationDetails,
    };

    let stepOutput: StepExecutorOutput;
    const errors: Array<string> = [];
    const startTimestamp = new Date().toISOString();

    let nextStepName: string | null = null;
    try {
      stepOutput = await currentStepExecutor.execute({
        integrationDetails: stepIntegrationDetails,
        input: userInput,
      });
    } catch (e) {
      stepOutput = {
        status: 'failure',
        payload: undefined,
      };
      errors.push(String(e));
      nextStepName = currentWorkflowState.nextStepName;
    }

    const endTimestamp = new Date().toISOString();

    const newExecutionHistoryItem: ExecutionHistoryItem = {
      id: uuidv4(),
      stepName: stepToExecuteDefinition.name,
      stepExecutorType: stepToExecuteDefinition.integrationDetails.type,
      input: userInput,
      output: stepOutput,
      startTimestamp,
      endTimestamp,
      errors,
      warnings: [],
      historySource: 'engine',
    };

    const newExecutionData = {
      ...currentWorkflowState.executionData,
      [`${stepToExecuteDefinition.name}Input`]: userInput,
      [`${stepToExecuteDefinition.name}Output`]: stepOutput.payload,
    };
    // Evaluate JSON Logic for next step
    if (
      stepOutput.status === 'success' &&
      stepToExecuteDefinition.transitionToStep
    ) {
      if (typeof stepToExecuteDefinition.transitionToStep === 'string') {
        nextStepName = stepToExecuteDefinition.transitionToStep;
      } else {
        const transitionLogic =
          stepToExecuteDefinition.transitionToStep as RulesLogic<AdditionalOperation>;
        try {
          nextStepName = jsonLogic.apply(transitionLogic, newExecutionData);
        } catch (e) {
          throw new IllegalArgumentException(
            `Invalid transition logic: ${JSON.stringify(transitionLogic)}. Error: ${e}`
          );
        }
      }
    } else if (stepOutput.status === 'successful_but_incomplete') {
      nextStepName = currentWorkflowState.nextStepName;
    }

    // If no valid next step is determined, workflow is complete
    const newWorkflowState: WorkflowState = {
      ...currentWorkflowState,
      executionData: newExecutionData,
      nextStepName,
      executionHistory: [
        ...currentWorkflowState.executionHistory,
        newExecutionHistoryItem,
      ],
    };

    return newWorkflowState;
  }

  public addExecutionHistoryItem(
    currentWorkflowState: WorkflowState,
    inputExecutionHistoryItem: ExecutionHistoryInput
  ): WorkflowState {
    const currentStepExecutor = this.stepExecutors.find(
      (stepExecutor) =>
        stepExecutor.type === inputExecutionHistoryItem.stepExecutorType
    );
    if (!currentStepExecutor) {
      throw new IllegalArgumentException(
        `Expected to find step executor of type '${inputExecutionHistoryItem.stepExecutorType}', not found.`
      );
    }

    const newExecutionHistoryItem: ExecutionHistoryItem = {
      ...inputExecutionHistoryItem,
      id: uuidv4(),
      historySource: 'external',
    };

    const newWorkflowState: WorkflowState = {
      ...currentWorkflowState,
      executionHistory: [
        ...currentWorkflowState.executionHistory,
        newExecutionHistoryItem,
      ],
    };

    return newWorkflowState;
  }
}

export default JustWorkflowItEngine;
