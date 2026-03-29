import type { Platform } from '../types/platform';
import { getPlatform } from './platform-detector';

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

export function getPlatformConfig<T>(config: PlatformConfig<T>): T | undefined {
  const platform = getPlatform();
  return config[platform];
}

export function filterMenuByPlatform(menu: PlatformMenuItem[]): PlatformMenuItem[] {
  const platform = getPlatform();

  return menu.filter(item => {
    if (!item.platform) return true;
    if (Array.isArray(item.platform)) {
      return item.platform.includes(platform);
    }
    return item.platform === platform;
  }).map(item => {
    if (item.children) {
      return {
        ...item,
        children: filterMenuByPlatform(item.children),
      };
    }
    return item;
  });
}

export function filterPagesByPlatform<T extends { platform?: Platform | Platform[] }>(
  pages: T[]
): T[] {
  const platform = getPlatform();

  return pages.filter(page => {
    if (!page.platform) return true;
    if (Array.isArray(page.platform)) {
      return page.platform.includes(platform);
    }
    return page.platform === platform;
  });
}

export function isPlatformEnabled(_feature: keyof PlatformConfig<boolean>): boolean {
  const platform = getPlatform();
  const featureConfig: PlatformConfig<boolean> = {
    'pc-browser': true,
    'pc-client': true,
    'pda': true,
    'pad': true,
  };
  return featureConfig[platform] ?? false;
}

export function getEntryPath(platformConfigs: PlatformConfig<string>): string {
  const platform = getPlatform();
  return platformConfigs[platform] || '/';
}