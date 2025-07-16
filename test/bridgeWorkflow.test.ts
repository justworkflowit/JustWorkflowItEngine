import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import { JustWorkflowItEngine } from '../src';
import {
  StepExecutor,
  StepExecutorArguments,
} from '../src/engine/stepExecutor';
import {
  JSONXformSchema,
  JustWorkflowItWorkflowDefinition,
} from '../src/workflowDefinition/types';
import WorkflowState from '../src/engine/workflowState';

const aWorkflowDefinition: JustWorkflowItWorkflowDefinition = {
  workflowName: 'BusinessInformationAggregator',
  steps: [
    {
      name: 'GetBusinessById',
      transitionToStep: 'WebScrapeBusinessInformation',
      integrationDetails: {
        type: 'GetBusinessByIdStepExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdGetBusinessByIdLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [{ from: 'workflowInput.businessId', to: 'businessId' }],
        },
        inputDefinition: { $ref: '#/definitions/GetBusinessByIdStepInput' },
        outputDefinition: { $ref: '#/definitions/GetBusinessByIdStepOutput' },
      },
    },
    {
      name: 'WebScrapeBusinessInformation',
      transitionToStep: 'SaveBusinessInformation',
      integrationDetails: {
        type: 'WebScrapeBusinessInformationStepExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdBusinessInformationScraperLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            { from: 'GetBusinessByIdOutput.businessId', to: 'businessId' },
            { from: 'GetBusinessByIdOutput.businessName', to: 'businessName' },
            {
              from: 'GetBusinessByIdOutput.businessWebsite',
              to: 'businessWebsite',
            },
            {
              from: 'GetBusinessByIdOutput.businessNeighborhood',
              to: 'businessNeighborhood',
            },
            {
              from: 'GetBusinessByIdOutput.businessAddress',
              to: 'businessAddress',
            },
            {
              from: 'GetBusinessByIdOutput.businessEventListUrl',
              to: 'businessEventListUrl',
            },
          ],
        },
        inputDefinition: {
          $ref: '#/definitions/webScrapeBusinessInformationInput',
        },
        outputDefinition: { $ref: '#/definitions/GetBusinessByIdStepOutput' },
      },
    },
    {
      name: 'SaveBusinessInformation',
      transitionToStep: 'ScrapeEventListInformation',
      integrationDetails: {
        type: 'SaveBusinessInformationStepExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdSaveBusinessLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            { from: 'WebScrapeBusinessInformationOutput', to: 'business' },
          ],
        },
        inputDefinition: { $ref: '#/definitions/saveBusinessInput' },
        outputDefinition: { $ref: '#/definitions/GetBusinessByIdStepOutput' },
      },
    },
    {
      name: 'ScrapeEventListInformation',
      transitionToStep: null,
      integrationDetails: {
        type: 'ScrapeEventListInformationStepExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdEventListScraperLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            { from: 'GetBusinessByIdOutput.businessId', to: 'businessId' },
            { from: 'GetBusinessByIdOutput.businessName', to: 'businessName' },
            {
              from: 'GetBusinessByIdOutput.businessWebsite',
              to: 'businessWebsite',
            },
            {
              from: 'GetBusinessByIdOutput.businessNeighborhood',
              to: 'businessNeighborhood',
            },
            {
              from: 'GetBusinessByIdOutput.businessAddress',
              to: 'businessAddress',
            },
            {
              from: 'GetBusinessByIdOutput.businessEventListUrl',
              to: 'businessEventListUrl',
            },
          ],
        },
        inputDefinition: { $ref: '#/definitions/GetBusinessByIdStepOutput' },
        outputDefinition: {
          $ref: '#/definitions/scrapeEventListInformationOutput',
        },
      },
    },
  ],
  definitions: {
    workflowInput: {
      type: 'object',
      properties: {
        businessId: { type: 'string' },
      },
      required: ['businessId'],
    },
    businessFields: {
      type: 'object',
      properties: {
        businessId: { type: 'string' },
        businessName: { type: 'string' },
        businessWebsite: { type: 'string' },
        businessNeighborhood: { type: 'string' },
        businessAddress: { type: 'string' },
        businessEventListUrl: { type: 'string' },
        businessPlatform: { type: 'string' },
      },
      required: [
        'businessId',
        'businessName',
        'businessWebsite',
        'businessNeighborhood',
        'businessAddress',
        'businessEventListUrl',
      ],
      additionalProperties: false,
    },

    GetBusinessByIdStepInput: {
      type: 'object',
      properties: {
        businessId: { type: 'string' },
      },
      required: ['businessId'],
      additionalProperties: false,
    },

    GetBusinessByIdStepOutput: { $ref: '#/definitions/businessFields' },

    webScrapeBusinessInformationInput: { $ref: '#/definitions/businessFields' },

    saveBusinessInput: {
      type: 'object',
      properties: {
        business: { $ref: '#/definitions/businessFields' },
      },
      required: ['business'],
      additionalProperties: false,
    },

    scrapeEventListInformationOutput: {
      type: 'object',
      properties: {
        eventId: { type: 'string' },
        eventName: { type: 'string' },
        eventStartTime: { type: 'string' },
        eventEndTime: { type: 'string' },
        eventHostName: { type: 'string' },
        eventAddress: { type: 'string' },
        eventNeighborhood: { type: 'string' },
        eventCategories: {
          type: 'array',
          items: { type: 'string' },
        },
        searchTags: {
          type: 'array',
          items: { type: 'string' },
        },
        eventImageUrl: { type: 'string' },
        eventLinkUrl: { type: 'string' },
        eventDescription: { type: 'string' },
      },
      required: [
        'eventId',
        'eventName',
        'eventStartTime',
        'eventHostName',
        'eventAddress',
      ],
      additionalProperties: false,
    },
  },
};

function generateDataFromSchema(
  singleObjectSchema: Schema,
  singleObjectSchemaRef: string,
  transformer?: JSONXformSchema,
  data?: Record<string, unknown>
): Record<string, unknown> {
  // eslint-disable-next-line no-param-reassign
  singleObjectSchema.definitions = JSON.parse(
    JSON.stringify(aWorkflowDefinition.definitions)
  );

  if (singleObjectSchemaRef) {
    const definitionKey = singleObjectSchemaRef.replace('#/definitions/', '');
    // eslint-disable-next-line no-param-reassign
    delete singleObjectSchema.definitions?.[definitionKey];
  }

  if (transformer) {
    // eslint-disable-next-line global-require
    const xform = require('@nkorai/json-xform');
    const { mapToNewObject } = xform;
    return mapToNewObject(data || {}, transformer);
  }
  return JSONSchemaFaker.generate(singleObjectSchema) as Record<
    string,
    unknown
  >;
}

const GetBusinessByIdStepExecutor: StepExecutor = {
  type: 'GetBusinessByIdStepExecutor',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({
      ...generateDataFromSchema(
        aWorkflowDefinition.definitions.GetBusinessByIdStepOutput as any,
        '#/definitions/GetBusinessByIdStepOutput'
      ),
      businessId: (_args.input as any)?.businessId,
    }),
};

const WebScrapeBusinessInformationStepExecutor: StepExecutor = {
  type: 'WebScrapeBusinessInformationStepExecutor',
  execute: (): Promise<Record<string, unknown>> =>
    Promise.resolve(
      generateDataFromSchema(
        aWorkflowDefinition.definitions.GetBusinessByIdStepOutput as any,
        '#/definitions/GetBusinessByIdStepOutput'
      )
    ),
};

const SaveBusinessInformationStepExecutor: StepExecutor = {
  type: 'SaveBusinessInformationStepExecutor',
  execute: (): Promise<Record<string, unknown>> =>
    Promise.resolve(
      generateDataFromSchema(
        aWorkflowDefinition.definitions.GetBusinessByIdStepOutput as any,
        '#/definitions/GetBusinessByIdStepOutput'
      )
    ),
};

const ScrapeEventListInformationStepExecutor: StepExecutor = {
  type: 'ScrapeEventListInformationStepExecutor',
  execute: (): Promise<Record<string, unknown>> =>
    Promise.resolve(
      generateDataFromSchema(
        aWorkflowDefinition.definitions
          .ScrapeEventListInformationStepOutput as any,
        '#/definitions/ScrapeEventListInformationStepOutput'
      )
    ),
};

const stepExecutors = [
  GetBusinessByIdStepExecutor,
  WebScrapeBusinessInformationStepExecutor,
  SaveBusinessInformationStepExecutor,
  ScrapeEventListInformationStepExecutor,
];

describe('Bridge Workflow Engine Test Cases', () => {
  test('run the workflow definition', async () => {
    const engine = new JustWorkflowItEngine({
      workflowDefinition: JSON.stringify(aWorkflowDefinition),
      stepExecutors,
      workflowInput: {
        businessId: 'testBusinessId',
      },
    });

    let currentWorkflowState: WorkflowState = {
      nextStepName: aWorkflowDefinition.steps[0]!.name,
      executionData: {},
      executionHistory: [],
    };

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    console.log('Naush ', currentWorkflowState);
    expect(currentWorkflowState.nextStepName).toBe(
      'WebScrapeBusinessInformation'
    );
    expect(
      Object.keys(currentWorkflowState.executionData.GetBusinessByIdOutput)
    ).toContainEqual('businessAddress');
    expect(
      currentWorkflowState.executionData.GetBusinessByIdOutput.businessId
    ).toBe('testBusinessId');

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.nextStepName).toBe('SaveBusinessInformation');

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.nextStepName).toBe(
      'ScrapeEventListInformation'
    );

    // currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    // expect(currentWorkflowState.nextStepName).toBe(null);
  });
});
