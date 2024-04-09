interface WorkflowState {
  nextStepName: String;
  userspace: {
    [key: string]: any;
  };
}

export default WorkflowState;
