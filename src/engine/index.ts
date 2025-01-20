import { IllegalArgumentException, IllegalStateException } from '../exceptions';
import StepExecutor, { StepExecutorIntegrationDetails } from './stepExecutor';
import WorkflowState from '../workflowState';
import validateAndGetWorkflowDefinition from '../workflowDefinition';
import {
  StepDefinition,
  WorkflowDefinition,
} from '../workflowDefinition/types';

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

  public executeNextStep(currentWorkflowState: WorkflowState): WorkflowState {
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
    const stepResult = currentStepExecutor.execute({
      integrationDetails: stepIntegrationDetails,
      parameters: userParameters,
    });

    const newWorkflowState: WorkflowState = {
      ...currentWorkflowState,
      userSpace: {
        ...currentWorkflowState.userSpace,
        [`${stepToExecuteDefinition.name}Parameters`]: userParameters,
        [`${stepToExecuteDefinition.name}Result`]: stepResult,
      },
      nextStepName: stepToExecuteDefinition.transitionToStep as string,
    };

    return newWorkflowState;
  }
}

export default JustWorkflowItEngine;
