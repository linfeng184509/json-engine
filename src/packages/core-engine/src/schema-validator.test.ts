import { describe, it, expect } from 'vitest';
import { validateSchema, createSchemaValidator, createJsonSchema } from './schema-validator';
import type { JsonSchema } from './schema-validator';

describe('validateSchema', () => {
  describe('valid objects', () => {
    it('should return valid for a simple string', () => {
      const schema: JsonSchema = { type: 'string' };
      const result = validateSchema('hello', schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return valid for a simple number', () => {
      const schema: JsonSchema = { type: 'number' };
      const result = validateSchema(42, schema);
      expect(result.valid).toBe(true);
    });

    it('should return valid for a boolean', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const result = validateSchema(true, schema);
      expect(result.valid).toBe(true);
    });

    it('should return valid for null with type null', () => {
      const schema: JsonSchema = { type: 'null' };
      const result = validateSchema(null, schema);
      expect(result.valid).toBe(true);
    });

    it('should return valid for an object', () => {
      const schema: JsonSchema = { type: 'object' };
      const result = validateSchema({ a: 1 }, schema);
      expect(result.valid).toBe(true);
    });

    it('should return valid for an array', () => {
      const schema: JsonSchema = { type: 'array' };
      const result = validateSchema([1, 2, 3], schema);
      expect(result.valid).toBe(true);
    });

    it('should return valid for any type', () => {
      const schema: JsonSchema = { type: 'any' };
      expect(validateSchema('str', schema).valid).toBe(true);
      expect(validateSchema(123, schema).valid).toBe(true);
      expect(validateSchema({ a: 1 }, schema).valid).toBe(true);
    });

    it('should return valid for any type with nullable', () => {
      const schema: JsonSchema = { type: 'any', nullable: true };
      expect(validateSchema(null, schema).valid).toBe(true);
    });
  });

  describe('type validation', () => {
    it('should fail when expecting string but got number', () => {
      const schema: JsonSchema = { type: 'string' };
      const result = validateSchema(123, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].expected).toBe('string');
      expect(result.errors[0].received).toBe('number');
    });

    it('should fail when expecting number but got string', () => {
      const schema: JsonSchema = { type: 'number' };
      const result = validateSchema('not a number', schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].expected).toBe('number');
      expect(result.errors[0].received).toBe('string');
    });

    it('should fail when expecting boolean but got number', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const result = validateSchema(1, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].expected).toBe('boolean');
      expect(result.errors[0].received).toBe('number');
    });

    it('should fail when expecting object but got array', () => {
      const schema: JsonSchema = { type: 'object' };
      const result = validateSchema([1, 2], schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].expected).toBe('object');
      expect(result.errors[0].received).toBe('array');
    });

    it('should fail when expecting array but got object', () => {
      const schema: JsonSchema = { type: 'array' };
      const result = validateSchema({ a: 1 }, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].expected).toBe('array');
      expect(result.errors[0].received).toBe('object');
    });

    it('should fail when expecting null but got string', () => {
      const schema: JsonSchema = { type: 'null' };
      const result = validateSchema('not null', schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].expected).toBe('null');
      expect(result.errors[0].received).toBe('string');
    });
  });

  describe('required properties', () => {
    it('should pass when all required properties are present', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      };
      const result = validateSchema({ name: 'John', age: 30 }, schema);
      expect(result.valid).toBe(true);
    });

    it('should fail when a required property is missing', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      };
      const result = validateSchema({ name: 'John' }, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("Required property 'age' is missing");
    });

    it('should report multiple missing required properties', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'string' },
        },
        required: ['a', 'b', 'c'],
      };
      const result = validateSchema({}, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('enum validation', () => {
    it('should pass when value is in enum', () => {
      const schema: JsonSchema = { type: 'string', enum: ['red', 'green', 'blue'] };
      expect(validateSchema('red', schema).valid).toBe(true);
      expect(validateSchema('green', schema).valid).toBe(true);
    });

    it('should fail when value is not in enum', () => {
      const schema: JsonSchema = { type: 'string', enum: ['red', 'green', 'blue'] };
      const result = validateSchema('yellow', schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('not one of the allowed values');
    });

    it('should validate number enums', () => {
      const schema: JsonSchema = { type: 'number', enum: [1, 2, 3] };
      expect(validateSchema(2, schema).valid).toBe(true);
      expect(validateSchema(4, schema).valid).toBe(false);
    });
  });

  describe('minimum/maximum for numbers', () => {
    it('should pass when value is within range', () => {
      const schema: JsonSchema = { type: 'number', minimum: 0, maximum: 100 };
      expect(validateSchema(50, schema).valid).toBe(true);
      expect(validateSchema(0, schema).valid).toBe(true);
      expect(validateSchema(100, schema).valid).toBe(true);
    });

    it('should fail when value is below minimum', () => {
      const schema: JsonSchema = { type: 'number', minimum: 10 };
      const result = validateSchema(5, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('less than minimum');
    });

    it('should fail when value is above maximum', () => {
      const schema: JsonSchema = { type: 'number', maximum: 10 };
      const result = validateSchema(15, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('greater than maximum');
    });
  });

  describe('minLength/maxLength/pattern for strings', () => {
    it('should pass when string length is within range', () => {
      const schema: JsonSchema = { type: 'string', minLength: 2, maxLength: 5 };
      expect(validateSchema('abc', schema).valid).toBe(true);
      expect(validateSchema('ab', schema).valid).toBe(true);
      expect(validateSchema('abcde', schema).valid).toBe(true);
    });

    it('should fail when string is too short', () => {
      const schema: JsonSchema = { type: 'string', minLength: 3 };
      const result = validateSchema('ab', schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('less than minLength');
    });

    it('should fail when string is too long', () => {
      const schema: JsonSchema = { type: 'string', maxLength: 3 };
      const result = validateSchema('abcd', schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('greater than maxLength');
    });

    it('should pass when string matches pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^[a-z]+$' };
      expect(validateSchema('hello', schema).valid).toBe(true);
    });

    it('should fail when string does not match pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^[a-z]+$' };
      const result = validateSchema('Hello123', schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('does not match pattern');
    });
  });

  describe('additionalProperties: false', () => {
    it('should pass when only defined properties are present', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false,
      };
      expect(validateSchema({ name: 'John' }, schema).valid).toBe(true);
    });

    it('should fail when additional properties are present', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false,
      };
      const result = validateSchema({ name: 'John', extra: 'field' }, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain("Additional property 'extra' is not allowed");
    });

    it('should allow additional properties when additionalProperties is not false', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      expect(validateSchema({ name: 'John', extra: 'field' }, schema).valid).toBe(true);
    });
  });

  describe('array items validation', () => {
    it('should pass when all items match the items schema', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'number' },
      };
      expect(validateSchema([1, 2, 3], schema).valid).toBe(true);
    });

    it('should fail when an item does not match the items schema', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'number' },
      };
      const result = validateSchema([1, 'two', 3], schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toBe('[1]');
      expect(result.errors[0].expected).toBe('number');
      expect(result.errors[0].received).toBe('string');
    });

    it('should validate nested object items', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: { id: { type: 'number' } },
          required: ['id'],
        },
      };
      expect(validateSchema([{ id: 1 }, { id: 2 }], schema).valid).toBe(true);
      const result = validateSchema([{ id: 1 }, { name: 'test' }], schema);
      expect(result.valid).toBe(false);
    });
  });

  describe('nullable', () => {
    it('should pass when value is null and nullable is true', () => {
      const schema: JsonSchema = { type: 'string', nullable: true };
      expect(validateSchema(null, schema).valid).toBe(true);
    });

    it('should fail when value is null and nullable is false', () => {
      const schema: JsonSchema = { type: 'string', nullable: false };
      const result = validateSchema(null, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Value is null');
    });

    it('should fail when value is null and nullable is not set', () => {
      const schema: JsonSchema = { type: 'string' };
      const result = validateSchema(null, schema);
      expect(result.valid).toBe(false);
    });

    it('should pass non-null values when nullable is true', () => {
      const schema: JsonSchema = { type: 'string', nullable: true };
      expect(validateSchema('hello', schema).valid).toBe(true);
    });
  });

  describe('nested object validation', () => {
    it('should validate nested object properties', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            required: ['name'],
          },
        },
        required: ['user'],
      };
      expect(validateSchema({ user: { name: 'John', age: 30 } }, schema).valid).toBe(true);
    });

    it('should report errors with correct nested paths', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            required: ['name'],
          },
        },
        required: ['user'],
      };
      const result = validateSchema({ user: {} }, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toBe('user.name');
    });
  });
});

describe('createSchemaValidator', () => {
  it('should return a function that validates against the schema', () => {
    const schema: JsonSchema = { type: 'number', minimum: 0 };
    const validator = createSchemaValidator(schema);
    expect(validator(5).valid).toBe(true);
    expect(validator(-1).valid).toBe(false);
  });
});

describe('createJsonSchema', () => {
  it('should create a schema with all options', () => {
    const schema = createJsonSchema({
      type: 'string',
      minLength: 1,
      maxLength: 10,
      pattern: '^[a-z]+$',
      nullable: true,
    });
    expect(schema.type).toBe('string');
    expect(schema.minLength).toBe(1);
    expect(schema.maxLength).toBe(10);
    expect(schema.pattern).toBe('^[a-z]+$');
    expect(schema.nullable).toBe(true);
  });

  it('should create a schema for objects', () => {
    const schema = createJsonSchema({
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
      additionalProperties: false,
    });
    expect(schema.type).toBe('object');
    expect(schema.properties?.name.type).toBe('string');
    expect(schema.required).toEqual(['name']);
    expect(schema.additionalProperties).toBe(false);
  });

  it('should create a schema for arrays', () => {
    const schema = createJsonSchema({
      type: 'array',
      items: { type: 'number' },
    });
    expect(schema.type).toBe('array');
    expect(schema.items?.type).toBe('number');
  });
});
