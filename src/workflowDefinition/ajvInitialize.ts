import Ajv, { AnySchemaObject } from 'ajv';
import schemas from '../preloadedSchemas';

export const getAjv = (): Ajv => {
  const ajv = new Ajv({
    allowUnionTypes: true,
    strictTuples: false,
    loadSchema: (): Promise<AnySchemaObject> => {
      throw new Error('External schema loading not allowed');
    },
  });

  // Register schemas
  Object.entries(schemas).forEach(([key, schema]) => {
    ajv.addSchema(schema, key);
  });

  return ajv;
};
