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
        type: 'GetBusinessByIdExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdGetBusinessByIdLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [{ from: 'workflowInput.businessId', to: 'businessId' }],
        },
        inputDefinition: {
          $ref: '#/definitions/getBusinessByIdInput',
        },
        outputDefinition: {
          $ref: '#/definitions/getBusinessByIdOutput',
        },
      },
    },
    {
      name: 'WebScrapeBusinessInformation',
      transitionToStep: 'TranslateAddressToGeoCodes',
      integrationDetails: {
        type: 'WebScrapeBusinessInformationExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdBusinessInformationScraperLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            {
              from: 'GetBusinessByIdOutput.businessId',
              to: 'businessId',
            },
            {
              from: 'GetBusinessByIdOutput.businessName',
              to: 'businessName',
            },
            {
              from: 'GetBusinessByIdOutput.businessWebsite',
              to: 'businessWebsite',
            },
            {
              from: 'GetBusinessByIdOutput.businessNeighborhood',
              to: 'businessNeighborhood',
            },
            {
              // eslint-disable-next-line no-template-curly-in-string
              withTemplate: '${GetBusinessByIdOutput.businessAddress}',
              to: 'businessAddress',
            },
            {
              from: 'GetBusinessByIdOutput.businessCity',
              to: 'businessCity',
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
        outputDefinition: {
          $ref: '#/definitions/getBusinessByIdOutput',
        },
      },
    },
    {
      name: 'TranslateAddressToGeoCodes',
      transitionToStep: 'SaveBusinessInformation',
      integrationDetails: {
        type: 'TranslateAddressToGeoCodesExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdTranslateAddressToGeoCodesLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            {
              from: 'WebScrapeBusinessInformationOutput.businessAddress',
              to: 'fullAddress',
            },
          ],
        },
        inputDefinition: {
          $ref: '#/definitions/translateAddressToGeoCodesInput',
        },
        outputDefinition: {
          $ref: '#/definitions/translateAddressToGeoCodesOutput',
        },
      },
    },
    {
      name: 'SaveBusinessInformation',
      transitionToStep: 'ScrapeEventListInformation',
      integrationDetails: {
        type: 'SaveBusinessInformationExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdSaveBusinessLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            {
              from: 'WebScrapeBusinessInformationOutput',
              to: 'business',
            },
            {
              to: 'business.businessId',
              // eslint-disable-next-line no-template-curly-in-string
              withTemplate: '${GetBusinessByIdOutput.businessId}',
            },
            {
              to: 'business.businessGeoCodeData',
              from: 'TranslateAddressToGeoCodesOutput',
            },
          ],
        },
        inputDefinition: {
          $ref: '#/definitions/saveBusinessInput',
        },
        outputDefinition: {
          $ref: '#/definitions/getBusinessByIdOutput',
        },
      },
    },
    {
      name: 'ScrapeEventListInformation',
      transitionToStep: 'ReconcileAndSaveEvents',
      integrationDetails: {
        type: 'ScrapeEventListInformationExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdEventListScraperLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            {
              from: 'SaveBusinessInformationOutput.businessId',
              to: 'businessId',
            },
            {
              from: 'SaveBusinessInformationOutput.businessName',
              to: 'businessName',
            },
            {
              from: 'SaveBusinessInformationOutput.businessWebsite',
              to: 'businessWebsite',
            },
            {
              from: 'SaveBusinessInformationOutput.businessNeighborhood',
              to: 'businessNeighborhood',
            },
            {
              from: 'SaveBusinessInformationOutput.businessCity',
              to: 'businessCity',
            },
            {
              from: 'SaveBusinessInformationOutput.businessAddress',
              to: 'businessAddress',
            },
            {
              from: 'SaveBusinessInformationOutput.businessEventListUrl',
              to: 'businessEventListUrl',
            },
            {
              from: 'SaveBusinessInformationOutput.businessGeoCodeData',
              to: 'businessGeoCodeData',
            },
          ],
        },
        inputDefinition: {
          $ref: '#/definitions/getBusinessByIdOutput',
        },
        outputDefinition: {
          $ref: '#/definitions/scrapeEventListInformationOutput',
        },
      },
    },
    {
      name: 'ReconcileAndSaveEvents',
      transitionToStep: null,
      integrationDetails: {
        type: 'ReconcileAndSaveEventsExecutor',
        config: {
          region: 'us-east-1',
          functionName: 'BridgeAppProdReconcileAndSaveEventsLambda',
          accountId: '547534196569',
        },
        inputTransformer: {
          fieldset: [
            {
              from: 'SaveBusinessInformationOutput',
              to: 'business',
            },
            {
              from: 'ScrapeEventListInformationOutput.events',
              to: 'events',
            },
          ],
        },
        inputDefinition: {
          $ref: '#/definitions/reconcileAndSaveEventsInput',
        },
        outputDefinition: {
          $ref: '#/definitions/getBusinessByIdOutput',
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
        businessCity: { type: 'string' },
        businessAddress: { type: 'string' },
        businessEventListUrl: { type: 'string' },
        businessPlatform: { type: 'string' },
        businessGeoCodeData: { $ref: '#/definitions/geoCodeData' },
      },
      required: [
        'businessId',
        'businessName',
        'businessWebsite',
        'businessNeighborhood',
        'businessCity',
        'businessAddress',
        'businessEventListUrl',
      ],
      additionalProperties: false,
    },
    eventFields: {
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
        eventCity: { type: 'string' },
      },
      required: [
        'eventId',
        'eventName',
        'eventStartTime',
        'eventHostName',
        'eventAddress',
        'eventCity',
      ],
    },
    getBusinessByIdInput: {
      type: 'object',
      properties: {
        businessId: { type: 'string' },
      },
      required: ['businessId'],
      additionalProperties: false,
    },
    getBusinessByIdOutput: { $ref: '#/definitions/businessFields' },
    webScrapeBusinessInformationInput: {
      $ref: '#/definitions/businessFields',
    },
    translateAddressToGeoCodesInput: {
      type: 'object',
      properties: {
        fullAddress: { type: 'string' },
      },
      required: ['fullAddress'],
      additionalProperties: false,
    },
    translateAddressToGeoCodesOutput: { $ref: '#/definitions/geoCodeData' },
    geoCodeData: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lon: { type: 'number' },
        geoCodeHashPrefix: { type: 'string' },
      },
      required: ['lat', 'lon', 'geoCodeHashPrefix'],
      additionalProperties: false,
    },
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
        events: {
          type: 'array',
          items: { $ref: '#/definitions/eventFields' },
        },
      },
      required: ['events'],
      additionalProperties: false,
    },
    reconcileAndSaveEventsInput: {
      type: 'object',
      properties: {
        business: { $ref: '#/definitions/businessFields' },
        events: {
          type: 'array',
          items: { $ref: '#/definitions/eventFields' },
        },
      },
      required: ['events'],
      additionalProperties: false,
    },
  },
};

function generateDataFromSchema(
  singleObjectSchemaInput: Schema,
  singleObjectSchemaRef: string,
  transformer?: JSONXformSchema,
  data?: Record<string, unknown>
): Record<string, unknown> {
  const singleObjectSchema = JSON.parse(
    JSON.stringify(singleObjectSchemaInput)
  );
  singleObjectSchema.definitions = JSON.parse(
    JSON.stringify(aWorkflowDefinition.definitions)
  );

  if (singleObjectSchemaRef) {
    const definitionKey = singleObjectSchemaRef.replace('#/definitions/', '');
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
  type: 'GetBusinessByIdExecutor',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({
      ...generateDataFromSchema(
        aWorkflowDefinition.definitions.getBusinessByIdOutput as any,
        '#/definitions/getBusinessByIdOutput'
      ),
      businessId: (_args.input as any)?.businessId,
    }),
};

const WebScrapeBusinessInformationStepExecutor: StepExecutor = {
  type: 'WebScrapeBusinessInformationExecutor',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({
      ...generateDataFromSchema(
        aWorkflowDefinition.definitions.getBusinessByIdOutput as any,
        '#/definitions/getBusinessByIdOutput'
      ),
      businessId: (_args.input as any)!.businessId,
    }),
};

const TranslateAddressToGeoCodesStepExecutor: StepExecutor = {
  type: 'TranslateAddressToGeoCodesExecutor',
  execute: (): Promise<Record<string, unknown>> =>
    Promise.resolve(
      generateDataFromSchema(
        aWorkflowDefinition.definitions.translateAddressToGeoCodesOutput as any,
        '#/definitions/translateAddressToGeoCodesOutput'
      )
    ),
};

const SaveBusinessInformationStepExecutor: StepExecutor = {
  type: 'SaveBusinessInformationExecutor',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({
      ...generateDataFromSchema(
        aWorkflowDefinition.definitions.getBusinessByIdOutput as any,
        '#/definitions/getBusinessByIdOutput'
      ),
      businessId: (_args.input as any)!.businessId,
    }),
};

const ScrapeEventListInformationStepExecutor: StepExecutor = {
  type: 'ScrapeEventListInformationExecutor',
  execute: (): Promise<Record<string, unknown>> =>
    Promise.resolve(
      generateDataFromSchema(
        aWorkflowDefinition.definitions.scrapeEventListInformationOutput as any,
        '#/definitions/scrapeEventListInformationOutput'
      )
    ),
};

const ReconcileAndSaveEventsStepExecutor: StepExecutor = {
  type: 'ReconcileAndSaveEventsExecutor',
  execute: (_args: StepExecutorArguments): Promise<Record<string, unknown>> =>
    Promise.resolve({
      ...generateDataFromSchema(
        aWorkflowDefinition.definitions.getBusinessByIdOutput as any,
        '#/definitions/getBusinessByIdOutput'
      ),
      businessId: (_args.input as any)?.businessId,
    }),
};

const stepExecutors = [
  GetBusinessByIdStepExecutor,
  WebScrapeBusinessInformationStepExecutor,
  TranslateAddressToGeoCodesStepExecutor,
  SaveBusinessInformationStepExecutor,
  ScrapeEventListInformationStepExecutor,
  ReconcileAndSaveEventsStepExecutor,
];

describe('Bridge Workflow Engine Test Cases', () => {
  test('run the workflow definition mid execution', async () => {
    let currentWorkflowState = {
      executionData: {
        workflowInput: { businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887' },
        GetBusinessByIdInput: {
          businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
        },
        GetBusinessByIdOutput: {
          businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
          businessWebsite: 'https://www.thegoldmark.com/',
          createdAt: '2025-07-16T16:10:27.221Z',
          businessAddress:
            'Goldmark, 4517 Butler Street, Pittsburgh, PA, 15201, United States',
          businessName: 'Goldmark',
          businessCity: 'Pittsburgh',
          GSI5SK: 'thegoldmark.com',
          businessNeighborhood: 'Lawrenceville',
          GSI5PK: 'BUSINESS_WEBSITE',
          updatedAt: '2025-07-21T13:15:40.217Z',
          SK: 'METADATA',
          businessEventListUrl: 'https://www.thegoldmark.com/events',
          PK: 'BUSINESS#e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
        },
        WebScrapeBusinessInformationInput: {
          businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
          businessName: 'Goldmark',
          businessWebsite: 'https://www.thegoldmark.com/',
          businessNeighborhood: 'Lawrenceville',
          businessAddress:
            'Goldmark, 4517 Butler Street, Pittsburgh, PA, 15201, United States',
          businessCity: 'Pittsburgh',
          businessEventListUrl: 'https://www.thegoldmark.com/events',
        },
        WebScrapeBusinessInformationOutput: {
          businessName: 'Goldmark',
          businessAddress:
            'Goldmark, 4517 Butler Street, Pittsburgh, PA, 15201, United States',
          businessNeighborhood: 'Lawrenceville',
          businessWebsite: 'https://www.thegoldmark.com/',
          businessEventListUrl: 'https://www.thegoldmark.com/events',
          businessWebsitePlatform: 'custom',
          businessCity: 'Pittsburgh',
        },
      },
      executionHistory: [
        {
          id: '49ba63b7-9c5c-4f72-872b-7a9a6247e9ab',
          stepName: 'GetBusinessById',
          stepExecutorType: '/justworkflowit/aws/lambda',
          input: { businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887' },
          output: {
            businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
            businessWebsite: 'https://www.thegoldmark.com/',
            createdAt: '2025-07-16T16:10:27.221Z',
            businessAddress:
              'Goldmark, 4517 Butler Street, Pittsburgh, PA, 15201, United States',
            businessName: 'Goldmark',
            businessCity: 'Pittsburgh',
            GSI5SK: 'thegoldmark.com',
            businessNeighborhood: 'Lawrenceville',
            GSI5PK: 'BUSINESS_WEBSITE',
            updatedAt: '2025-07-21T13:15:40.217Z',
            SK: 'METADATA',
            businessEventListUrl: 'https://www.thegoldmark.com/events',
            PK: 'BUSINESS#e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
          },
          status: 'success',
          startTimestamp: '2025-07-21T13:15:47.016Z',
          endTimestamp: '2025-07-21T13:15:47.705Z',
        },
        {
          id: 'c756922a-8c30-4fa7-8510-537885853094',
          stepName: 'WebScrapeBusinessInformation',
          stepExecutorType: '/justworkflowit/aws/lambda',
          input: {
            businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
            businessName: 'Goldmark',
            businessWebsite: 'https://www.thegoldmark.com/',
            businessNeighborhood: 'Lawrenceville',
            businessAddress:
              'Goldmark, 4517 Butler Street, Pittsburgh, PA, 15201, United States',
            businessCity: 'Pittsburgh',
            businessEventListUrl: 'https://www.thegoldmark.com/events',
          },
          output: {
            businessName: 'Goldmark',
            businessAddress:
              'Goldmark, 4517 Butler Street, Pittsburgh, PA, 15201, United States',
            businessNeighborhood: 'Lawrenceville',
            businessWebsite: 'https://www.thegoldmark.com/',
            businessEventListUrl: 'https://www.thegoldmark.com/events',
            businessWebsitePlatform: 'custom',
            businessCity: 'Pittsburgh',
          },
          status: 'success',
          startTimestamp: '2025-07-21T13:15:48.436Z',
          endTimestamp: '2025-07-21T13:17:09.688Z',
        },
      ],
      nextStepName: 'TranslateAddressToGeoCodes',
    } as WorkflowState;

    const engine = new JustWorkflowItEngine({
      workflowDefinition: JSON.stringify(aWorkflowDefinition),
      stepExecutors,
      workflowInput: {
        businessId: 'e8d852f1-c0e5-4ce9-a2a9-5416abedf887',
      },
    });

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe('SaveBusinessInformation');

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe(
      'ScrapeEventListInformation'
    );

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe('ReconcileAndSaveEvents');

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe(null);
  });

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
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
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
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe(
      'TranslateAddressToGeoCodes'
    );

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe('SaveBusinessInformation');

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe(
      'ScrapeEventListInformation'
    );

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe('ReconcileAndSaveEvents');

    currentWorkflowState = await engine.executeNextStep(currentWorkflowState);
    expect(currentWorkflowState.executionHistory.at(-1)?.error).toBeUndefined();
    expect(currentWorkflowState.nextStepName).toBe(null);
  });
});
