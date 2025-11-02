# JustWorkflowIt Engine

[![Node.js Package](https://github.com/nkorai/JustWorkflowItEngine/actions/workflows/npm-publish.yml/badge.svg?branch=main)](https://github.com/nkorai/JustWorkflowItEngine/actions/workflows/npm-publish.yml)

A lightweight workflow orchestration engine that lets you define complex workflows as JSON and execute them step-by-step. Think of it as a state machine with built-in data transformation, conditional branching, and retry logic.

## Why?

Most workflow engines force you into their runtime environment or require heavyweight infrastructure. JustWorkflowIt Engine is different:

- **JSON-based workflow definitions** - Version control your workflows like code
- **Bring your own executors** - Plug in any async function as a step executor
- **Framework agnostic** - Works in Node.js and browsers
- **Type-safe** - Full TypeScript support with runtime validation
- **Resumable** - Pause and resume workflows at any step
- **No dependencies on external services** - Run it anywhere JavaScript runs

## Installation

```bash
npm install @justworkflowit/engine
```

## Quick Start

Here's a simple two-step workflow that fetches user data and sends an email:

```typescript
import { JustWorkflowItEngine, StepExecutor } from '@justworkflowit/engine';

// Define your step executors (the actual work)
const fetchUserExecutor: StepExecutor = {
  type: 'fetchUser',
  execute: async ({ input }) => {
    const user = await db.getUser(input.userId);
    return { status: 'success', payload: user };
  }
};

const emailExecutor: StepExecutor = {
  type: 'sendEmail',
  execute: async ({ input }) => {
    await emailService.send(input.to, input.subject, input.body);
    return { status: 'success', payload: { sent: true } };
  }
};

// Define your workflow as JSON
const workflowDefinition = {
  workflowName: 'userNotification',
  steps: [
    {
      name: 'fetchUser',
      transitionToStep: 'sendEmail',
      integrationDetails: {
        type: 'fetchUser',
        inputDefinition: { $ref: '#/definitions/fetchUserInput' },
        outputDefinition: { $ref: '#/definitions/fetchUserOutput' }
      }
    },
    {
      name: 'sendEmail',
      transitionToStep: null, // null means workflow ends here
      integrationDetails: {
        type: 'sendEmail',
        inputDefinition: { $ref: '#/definitions/sendEmailInput' },
        outputDefinition: { $ref: '#/definitions/sendEmailOutput' },
        inputTransformer: {
          fieldset: [
            { from: 'fetchUserOutput.email', to: 'to' },
            { withTemplate: 'Welcome!', to: 'subject' },
            { from: 'fetchUserOutput.name', to: 'body' }
          ]
        }
      }
    }
  ],
  definitions: {
    fetchUserInput: {
      type: 'object',
      properties: { userId: { type: 'string' } },
      required: ['userId']
    },
    fetchUserOutput: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        name: { type: 'string' }
      }
    },
    sendEmailInput: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' }
      }
    },
    sendEmailOutput: {
      type: 'object',
      properties: { sent: { type: 'boolean' } }
    }
  }
};

// Initialize and run
const engine = new JustWorkflowItEngine({
  workflowDefinition: JSON.stringify(workflowDefinition),
  stepExecutors: [fetchUserExecutor, emailExecutor]
});

let state = {
  nextStepName: 'fetchUser',
  executionData: {},
  executionHistory: []
};

// Execute step by step
state = await engine.executeNextStep(state);
state = await engine.executeNextStep(state);

console.log(state.executionHistory); // See what happened
```

## Core Concepts

### Workflow Definition

A workflow is a JSON object with three parts:

1. **workflowName** - Identifier for your workflow
2. **steps** - Array of step definitions (what to do)
3. **definitions** - JSON Schema definitions for inputs/outputs

### Step Executors

Step executors are the actual implementations of work. Each executor must:

- Have a unique `type` that matches the workflow definition
- Implement an `execute` function that returns a promise
- Return a status (`success`, `failure`, or `successful_but_incomplete`)

### Workflow State

The engine is stateless. You manage the workflow state, which includes:

- `nextStepName` - Which step to execute next (null when done)
- `executionData` - All inputs and outputs from previous steps
- `executionHistory` - Full audit trail of what happened

This design lets you persist state anywhere (database, memory, local storage) and resume workflows later.

### Data Transformers

Transform data between steps using the `inputTransformer` field. Based on [json-xform](https://github.com/perpk/json-xform), it supports:

- Field mapping: `{ from: 'step1Output.userId', to: 'userId' }`
- Templates: `{ withTemplate: 'Hello {{name}}', to: 'greeting' }`
- Array operations: `{ fromEach: { field: 'items' }, to: 'processedItems' }`

### Conditional Branching

Use JSON Logic for conditional transitions:

```typescript
{
  name: 'checkStatus',
  transitionToStep: {
    if: [
      { '===': [{ var: 'checkStatusOutput.status' }, 'active'] },
      'sendWelcomeEmail',
      'sendReactivationEmail'
    ]
  },
  // ...
}
```

## API Reference

### `JustWorkflowItEngine`

**Constructor**

```typescript
new JustWorkflowItEngine({
  workflowDefinition: string,    // JSON string of workflow definition
  stepExecutors: StepExecutor[], // Array of step executor implementations
  workflowInput?: object         // Optional initial input data
})
```

**Methods**

#### `executeNextStep(currentState: WorkflowState): Promise<WorkflowState>`

Executes the next step in the workflow and returns updated state.

```typescript
const newState = await engine.executeNextStep(currentState);
```

#### `getStepUnderExecution(currentState: WorkflowState): StepDefinition`

Returns the definition of the step that will be executed next.

```typescript
const stepDef = engine.getStepUnderExecution(currentState);
console.log(`About to execute: ${stepDef.name}`);
```

#### `addExecutionHistoryItem(currentState: WorkflowState, historyItem: ExecutionHistoryInput): WorkflowState`

Manually add an execution history item (useful for external events).

```typescript
const newState = engine.addExecutionHistoryItem(currentState, {
  stepName: 'externalEvent',
  stepExecutorType: 'webhook',
  startTimestamp: new Date().toISOString(),
  endTimestamp: new Date().toISOString(),
  input: webhookPayload,
  output: { status: 'success', payload: {} },
  errors: [],
  warnings: []
});
```

### `StepExecutor`

```typescript
interface StepExecutor {
  type: string;
  execute: (args: StepExecutorArguments) => Promise<StepExecutorOutput>;
  configDefinition?: object; // Optional JSON Schema for step config validation
}

interface StepExecutorArguments {
  input: unknown;
  integrationDetails: {
    type: string;
    config?: object; // Static configuration for the executor
    [key: string]: unknown;
  };
}

interface StepExecutorOutput {
  status: 'success' | 'failure' | 'successful_but_incomplete';
  payload: unknown;
}
```

The `successful_but_incomplete` status is useful for long-running operations - it keeps the workflow on the same step for the next execution.

### `WorkflowState`

```typescript
interface WorkflowState {
  nextStepName: string | null;
  executionData: Record<string, unknown>;
  executionHistory: ExecutionHistoryItem[];
}
```

### `SampleEngineRunner`

A helper class for running workflows until completion:

```typescript
import { SampleEngineRunner } from '@justworkflowit/engine';

const runner = new SampleEngineRunner(engine, initialState);
await runner.runUntilTerminalStep();

const finalState = runner.getCurrentWorkflowState();
```

This runner handles retries automatically based on the `retries` field in step definitions.

## Advanced Features

### Retry Logic

Add automatic retries to any step:

```typescript
{
  name: 'unreliableApiCall',
  retries: 3,
  transitionToStep: 'nextStep',
  // ...
}
```

When using `SampleEngineRunner`, failed steps will be retried up to the specified count.

### Timeouts

Set execution time limits (currently informational, enforcement is executor-dependent):

```typescript
{
  name: 'longRunningTask',
  timeoutSeconds: 300,
  // ...
}
```

### Static Configuration

Pass static configuration to step executors:

```typescript
{
  name: 'sendEmail',
  integrationDetails: {
    type: 'email',
    config: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587
    },
    // ...
  }
}
```

Access it in your executor:

```typescript
const emailExecutor: StepExecutor = {
  type: 'email',
  configDefinition: {
    type: 'object',
    properties: {
      smtpHost: { type: 'string' },
      smtpPort: { type: 'number' }
    },
    required: ['smtpHost', 'smtpPort']
  },
  execute: async ({ integrationDetails }) => {
    const { smtpHost, smtpPort } = integrationDetails.config;
    // Use config to send email
  }
};
```

### Execution History

Every step execution is tracked with full details:

```typescript
interface ExecutionHistoryItem {
  id: string;
  stepName: string;
  stepExecutorType: string;
  input: unknown;
  output: StepExecutorOutput;
  startTimestamp: string;
  endTimestamp: string;
  errors: string[];
  warnings: string[];
  historySource: 'engine' | 'external';
  eventId?: string; // For external events
}
```

## Examples

### Conditional Workflow with JSON Logic

```typescript
const approvalWorkflow = {
  workflowName: 'documentApproval',
  steps: [
    {
      name: 'checkAmount',
      transitionToStep: {
        if: [
          { '>': [{ var: 'checkAmountOutput.amount' }, 10000] },
          'managerApproval',
          'autoApprove'
        ]
      },
      integrationDetails: {
        type: 'checkAmount',
        inputDefinition: { $ref: '#/definitions/checkAmountInput' },
        outputDefinition: { $ref: '#/definitions/checkAmountOutput' }
      }
    },
    {
      name: 'managerApproval',
      transitionToStep: 'finalizeDocument',
      integrationDetails: {
        type: 'approval',
        inputDefinition: { $ref: '#/definitions/approvalInput' },
        outputDefinition: { $ref: '#/definitions/approvalOutput' }
      }
    },
    {
      name: 'autoApprove',
      transitionToStep: 'finalizeDocument',
      integrationDetails: {
        type: 'autoApprove',
        inputDefinition: { $ref: '#/definitions/autoApproveInput' },
        outputDefinition: { $ref: '#/definitions/autoApproveOutput' }
      }
    },
    {
      name: 'finalizeDocument',
      transitionToStep: null,
      integrationDetails: {
        type: 'finalize',
        inputDefinition: { $ref: '#/definitions/finalizeInput' },
        outputDefinition: { $ref: '#/definitions/finalizeOutput' }
      }
    }
  ],
  definitions: {
    // ... schema definitions
  }
};
```

### Long-Running Operations

```typescript
const pollingExecutor: StepExecutor = {
  type: 'pollStatus',
  execute: async ({ input }) => {
    const status = await checkJobStatus(input.jobId);

    if (status === 'completed') {
      return { status: 'success', payload: { result: 'done' } };
    }

    // Return incomplete to retry this step
    return {
      status: 'successful_but_incomplete',
      payload: { status }
    };
  }
};

// In your runner loop, sleep between retries
while (state.nextStepName) {
  state = await engine.executeNextStep(state);

  const lastExecution = state.executionHistory[state.executionHistory.length - 1];
  if (lastExecution.output.status === 'successful_but_incomplete') {
    await sleep(5000); // Wait before retrying
  }
}
```

### Browser Usage

The engine works in browsers too:

```typescript
import { JustWorkflowItEngine } from '@justworkflowit/engine/browser';

const apiExecutor = {
  type: 'fetchApi',
  execute: async ({ input }) => {
    const response = await fetch(input.url);
    const data = await response.json();
    return { status: 'success', payload: data };
  }
};

// Rest is the same as Node.js usage
```

## Type Safety

The engine validates all inputs and outputs against JSON Schemas at runtime. TypeScript definitions are included for compile-time safety:

```typescript
import {
  JustWorkflowItEngine,
  JustWorkflowItWorkflowDefinition,
  StepExecutor,
  WorkflowState
} from '@justworkflowit/engine';
```

## License

MIT

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/nkorai/JustWorkflowItEngine).
