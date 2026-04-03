export type Platform = 'pc-browser' | 'pc-client' | 'pda' | 'pad';
export interface PlatformFeatures {
    fullscreen?: boolean;
    print?: boolean;
    export?: boolean;
    scan?: boolean;
    nfc?: boolean;
    offline?: boolean;
    touch?: boolean;
    gps?: boolean;
    camera?: boolean;
    bluetooth?: boolean;
}
export interface PlatformInfo {
    platform: Platform;
    features: PlatformFeatures;
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    touchPoints: number;
    isMobile: boolean;
}
export declare const PLATFORM_FEATURES: Record<Platform, PlatformFeatures>;
//# sourceMappingURL=platform.d.ts.map