import type { Platform, PlatformInfo, PlatformFeatures } from '../types/platform';
declare global {
    interface Window {
        electron?: unknown;
    }
}
export declare function detect(): PlatformInfo;
export declare function getPlatform(): Platform;
export declare function getPlatformFeatures(): PlatformFeatures;
export declare function isPlatform(platform: Platform): boolean;
export declare function isMobileDevice(): boolean;
//# sourceMappingURL=platform-detector.d.ts.map