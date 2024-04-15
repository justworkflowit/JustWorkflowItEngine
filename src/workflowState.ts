interface WorkflowState {
  nextStepName: string | null;
  userSpace: {
    [key: string]: any;
  };
}

export default WorkflowState;
