import { type VNode } from 'vue';
import type { VNodeDefinition, RenderContext, ExpressionValue } from '../types';
export declare function applyVIf(condition: ExpressionValue, context: RenderContext): boolean;
export declare function applyVShow(vnode: VNode, condition: ExpressionValue, context: RenderContext): VNode;
export interface VForResult {
    definition: VNodeDefinition;
    context: RenderContext;
}
export declare function applyVFor(node: VNodeDefinition, vFor: NonNullable<VNodeDefinition['directives']>['vFor'], context: RenderContext): VForResult[];
export declare function applyVModel(vModel: NonNullable<VNodeDefinition['directives']>['vModel'], context: RenderContext): Record<string, unknown>;
export declare function applyVOn(vOn: NonNullable<VNodeDefinition['directives']>['vOn'], context: RenderContext): Record<string, unknown>;
export declare function applyVBind(vBind: NonNullable<VNodeDefinition['directives']>['vBind'], context: RenderContext): Record<string, unknown>;
export declare function applyVHtml(expression: ExpressionValue, context: RenderContext): string;
export declare function applyVText(expression: ExpressionValue, context: RenderContext): string;
export declare function applyVOnce(type: string, props: Record<string, unknown> | null, children: string | number | VNode | undefined): VNode;
export interface VSlotProps {
    name?: string;
    props?: Record<string, unknown>;
}
export declare function applyVSlot(vSlot: NonNullable<VNodeDefinition['directives']>['vSlot'], context: RenderContext): VSlotProps | null;
export declare function applyVElseIf(condition: ExpressionValue, context: RenderContext): boolean;
export declare function applyVElse(_context: RenderContext): boolean;
//# sourceMappingURL=directive-runtime.d.ts.map