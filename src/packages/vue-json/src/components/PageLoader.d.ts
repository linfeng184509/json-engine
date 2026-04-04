import { type Component, type PropType, type VNode, type SlotsType } from 'vue';
export interface PageLoaderProps {
    schemaPath: string;
    layout?: string;
    cache?: boolean;
    extraComponents?: Record<string, Component>;
    onLoaded?: (result: {
        schemaPath: string;
        success: boolean;
    }) => void;
    onError?: (error: Error) => void;
}
export declare const PageLoader: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    schemaPath: {
        type: PropType<string>;
        required: true;
    };
    layout: {
        type: PropType<string>;
        default: null;
    };
    cache: {
        type: PropType<boolean>;
        default: boolean;
    };
    extraComponents: {
        type: PropType<Record<string, Component>>;
        default: () => {};
    };
}>, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    schemaPath: {
        type: PropType<string>;
        required: true;
    };
    layout: {
        type: PropType<string>;
        default: null;
    };
    cache: {
        type: PropType<boolean>;
        default: boolean;
    };
    extraComponents: {
        type: PropType<Record<string, Component>>;
        default: () => {};
    };
}>> & Readonly<{}>, {
    cache: boolean;
    extraComponents: Record<string, Component>;
    layout: string;
}, SlotsType<{
    loading?: () => VNode[];
    error?: (props: {
        error: Error;
        retry: () => void;
    }) => VNode[];
    default?: () => VNode[];
}>, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare function createPageLoader(): Component;
export declare function createDefaultLoadingSpinner(): VNode;
export declare function createDefaultErrorUI(error: Error, retry: () => void): VNode;
//# sourceMappingURL=PageLoader.d.ts.map