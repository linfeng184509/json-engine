type SchemaType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'any';

interface JsonSchema {
  type: SchemaType;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  additionalProperties?: boolean;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  nullable?: boolean;
}

interface ValidationError {
  path: string;
  message: string;
  expected: string;
  received: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function getTypeName(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function validateType(value: unknown, expectedType: SchemaType): boolean {
  if (expectedType === 'any') return true;
  
  const actualType = getTypeName(value);
  
  if (expectedType === 'null') {
    return value === null;
  }
  
  if (value === null) {
    return false;
  }
  
  return actualType === expectedType;
}

function validateEnum(value: unknown, enumValues: unknown[]): boolean {
  return enumValues.some(enumValue => {
    if (typeof enumValue !== typeof value) return false;
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value) === JSON.stringify(enumValue);
    }
    return value === enumValue;
  });
}

function validateNumber(value: number, schema: JsonSchema): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (schema.minimum !== undefined && value < schema.minimum) {
    errors.push({
      path: '',
      message: `Value ${value} is less than minimum ${schema.minimum}`,
      expected: `>= ${schema.minimum}`,
      received: String(value),
    });
  }
  
  if (schema.maximum !== undefined && value > schema.maximum) {
    errors.push({
      path: '',
      message: `Value ${value} is greater than maximum ${schema.maximum}`,
      expected: `<= ${schema.maximum}`,
      received: String(value),
    });
  }
  
  return errors;
}

function validateString(value: string, schema: JsonSchema): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push({
      path: '',
      message: `String length ${value.length} is less than minLength ${schema.minLength}`,
      expected: `length >= ${schema.minLength}`,
      received: `length = ${value.length}`,
    });
  }
  
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push({
      path: '',
      message: `String length ${value.length} is greater than maxLength ${schema.maxLength}`,
      expected: `length <= ${schema.maxLength}`,
      received: `length = ${value.length}`,
    });
  }
  
  if (schema.pattern !== undefined) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      errors.push({
        path: '',
        message: `String does not match pattern ${schema.pattern}`,
        expected: `matches ${schema.pattern}`,
        received: value,
      });
    }
  }
  
  return errors;
}

function validateValue(
  value: unknown,
  schema: JsonSchema,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Handle nullable
  if (value === null) {
    if (schema.nullable) {
      return errors;
    }
    if (schema.type !== 'null') {
      errors.push({
        path,
        message: 'Value is null but schema does not allow null',
        expected: schema.type,
        received: 'null',
      });
    }
    return errors;
  }
  
  // Validate type
  if (!validateType(value, schema.type)) {
    errors.push({
      path,
      message: `Type mismatch at ${path}`,
      expected: schema.type,
      received: getTypeName(value),
    });
    return errors;
  }
  
  // Validate enum
  if (schema.enum !== undefined) {
    if (!validateEnum(value, schema.enum)) {
      errors.push({
        path,
        message: `Value is not one of the allowed values`,
        expected: `one of [${schema.enum.join(', ')}]`,
        received: String(value),
      });
    }
  }
  
  // Type-specific validation
  if (schema.type === 'number' && typeof value === 'number') {
    errors.push(...validateNumber(value, schema).map(err => ({
      ...err,
      path: path || err.path,
    })));
  }
  
  if (schema.type === 'string' && typeof value === 'string') {
    errors.push(...validateString(value, schema).map(err => ({
      ...err,
      path: path || err.path,
    })));
  }
  
  // Validate object properties
  if (schema.type === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    
    // Check required properties
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in obj)) {
          errors.push({
            path: path ? `${path}.${requiredProp}` : requiredProp,
            message: `Required property '${requiredProp}' is missing`,
            expected: 'property exists',
            received: 'undefined',
          });
        }
      }
    }
    
    // Validate properties
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propName in obj) {
          const propPath = path ? `${path}.${propName}` : propName;
          errors.push(...validateValue(obj[propName], propSchema, propPath));
        }
      }
    }
    
    // Check additional properties
    if (schema.additionalProperties === false && schema.properties) {
      const allowedProps = new Set(Object.keys(schema.properties));
      for (const propName of Object.keys(obj)) {
        if (!allowedProps.has(propName)) {
          errors.push({
            path: path ? `${path}.${propName}` : propName,
            message: `Additional property '${propName}' is not allowed`,
            expected: 'no additional properties',
            received: propName,
          });
        }
      }
    }
  }
  
  // Validate array items
  if (schema.type === 'array' && Array.isArray(value) && schema.items) {
    for (let i = 0; i < value.length; i++) {
      const itemPath = `${path}[${i}]`;
      errors.push(...validateValue(value[i], schema.items, itemPath));
    }
  }
  
  return errors;
}

function validateSchema(input: unknown, schema: JsonSchema): ValidationResult {
  const errors = validateValue(input, schema, '');
  return {
    valid: errors.length === 0,
    errors,
  };
}

function createSchemaValidator(schema: JsonSchema): (input: unknown) => ValidationResult {
  return (input: unknown) => validateSchema(input, schema);
}

function createJsonSchema(options: Partial<JsonSchema> & { type: SchemaType }): JsonSchema {
  return {
    type: options.type,
    properties: options.properties,
    items: options.items,
    required: options.required,
    additionalProperties: options.additionalProperties,
    enum: options.enum,
    minimum: options.minimum,
    maximum: options.maximum,
    minLength: options.minLength,
    maxLength: options.maxLength,
    pattern: options.pattern,
    nullable: options.nullable,
  };
}

export {
  validateSchema,
  createSchemaValidator,
  createJsonSchema,
};

export type {
  SchemaType,
  JsonSchema,
  ValidationError,
  ValidationResult,
};
