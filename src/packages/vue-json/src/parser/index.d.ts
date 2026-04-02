import type { VueJsonSchemaInput, ParsedSchema, ParseResult } from '../types';
export declare function parseSchema(input: VueJsonSchemaInput): ParseResult<ParsedSchema>;
export { parseProps } from './props-parser';
export { parseEmits } from './emits-parser';
export { parseState } from './state-parser';
export { parseComputed } from './computed-parser';
export { parseMethods } from './methods-parser';
export { parseWatch } from './watch-parser';
export { parseProvide, parseInject } from './provide-inject-parser';
export { parseLifecycle } from './lifecycle-parser';
export { parseComponents } from './components-parser';
export { parseRender } from './render-parser';
export { getVueKeyParsers, toPascalCase, isValidVariableName } from './key-parsers';
export { vueParserConfig, createParserConfig } from '../config/vue-parser-config';
//# sourceMappingURL=index.d.ts.map