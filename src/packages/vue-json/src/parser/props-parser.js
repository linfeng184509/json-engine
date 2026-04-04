import { isExpressionParseData, isFunctionParseData, isReferenceParseData } from '@json-engine/core-engine';
import { createValidationError } from '../utils/error';
const TYPE_MAP = {
    String: String,
    Number: Number,
    Boolean: Boolean,
    Array: Array,
    Object: Object,
    Function: Function,
    Symbol: Symbol,
    BigInt: BigInt,
};
function parsePropType(type) {
    if (!type)
        return undefined;
    if (Array.isArray(type)) {
        return type.map((t) => TYPE_MAP[t]).filter(Boolean);
    }
    return TYPE_MAP[type];
}
function isPropertyValue(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value !== 'object')
        return true;
    const obj = value;
    if (typeof obj._type === 'string') {
        return ['expression', 'reference', 'scope', 'string', 'function'].includes(obj._type);
    }
    return true;
}
function parsePropertyValue(value) {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value !== 'object') {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        return value;
    }
    const obj = value;
    if (obj._type === 'string' && typeof obj.value === 'string') {
        return obj.value;
    }
    if (isExpressionParseData(value)) {
        throw createValidationError('default', 'Expression values in prop defaults are not supported at parse time. Use runtime evaluation.', 'literal value', value);
    }
    if (isReferenceParseData(value)) {
        throw createValidationError('default', 'Reference values in prop defaults are not supported at parse time. Use runtime evaluation.', 'literal value', value);
    }
    return value;
}
export function parseProps(definition, context) {
    const result = {};
    for (const [propName, propDef] of Object.entries(definition)) {
        try {
            if (typeof propDef !== 'object' || propDef === null) {
                throw createValidationError(`props.${propName}`, 'Property definition must be an object', 'object', propDef);
            }
            const def = propDef;
            const propOption = {};
            if (def.type) {
                propOption.type = parsePropType(def.type);
            }
            if (def.required === true) {
                propOption.required = true;
            }
            if (def.default !== undefined) {
                if (!isPropertyValue(def.default)) {
                    throw createValidationError(`props.${propName}.default`, 'Default must be a literal value or structured value', 'PropertyValue', def.default);
                }
                propOption.default = () => parsePropertyValue(def.default);
            }
            if (def.validator) {
                if (!isFunctionParseData(def.validator)) {
                    throw createValidationError(`props.${propName}.validator`, 'Validator must be a FunctionValue', 'FunctionValue', def.validator);
                }
                propOption.validator = new Function('value', `"use strict"; ${def.validator.body}`);
            }
            result[propName] = propOption;
        }
        catch (error) {
            context.errors.push({
                path: `props.${propName}`,
                message: error instanceof Error ? error.message : String(error),
                value: propDef,
            });
        }
    }
    return result;
}
//# sourceMappingURL=props-parser.js.map