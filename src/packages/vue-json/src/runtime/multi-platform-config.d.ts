import type { Platform } from '../types/platform';
export interface PlatformMenuItem {
    id: string;
    label: string;
    path?: string;
    icon?: string;
    children?: PlatformMenuItem[];
    platform?: Platform | Platform[];
    permissions?: string[];
}
export interface PlatformConfig<T> {
    'pc-browser'?: T;
    'pc-client'?: T;
    'pda'?: T;
    'pad'?: T;
}
export declare function getPlatformConfig<T>(config: PlatformConfig<T>): T | undefined;
export declare function filterMenuByPlatform(menu: PlatformMenuItem[]): PlatformMenuItem[];
export declare function filterPagesByPlatform<T extends {
    platform?: Platform | Platform[];
}>(pages: T[]): T[];
export declare function isPlatformEnabled(_feature: keyof PlatformConfig<boolean>): boolean;
export declare function getEntryPath(platformConfigs: PlatformConfig<string>): string;
//# sourceMappingURL=multi-platform-config.d.ts.map