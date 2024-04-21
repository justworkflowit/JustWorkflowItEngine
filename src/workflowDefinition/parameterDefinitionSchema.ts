interface ViaDefinition {
  type: 'date' | 'commands';
  sourceFormat?: string;
  format?: string;
}

interface FromEachDefinition {
  field: string;
  to?: string;
  flatten?: boolean;
  fieldset?: FieldsetDefinition[];
}

interface FieldsetDefinition {
  from?: string;
  to?: string;
  valueToKey?: boolean;
  withValueFrom?: string;
  withTemplate?: string;
  toArray?: boolean;
  via?: ViaDefinition;
  fromEach?: FromEachDefinition;
}

interface ParameterDefinition {
  fieldset: FieldsetDefinition[];
}

export default ParameterDefinition;
