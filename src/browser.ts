import Ajv from 'ajv';
// eslint-disable-next-line import/extensions
import schemas from './preloadedSchemas';

const ajv = new Ajv({ allowUnionTypes: true, strictTuples: false });

Object.entries(schemas).forEach(([key, schema]) => {
  ajv.addSchema(schema, key);
});

export { ajv };
export * from './index';
