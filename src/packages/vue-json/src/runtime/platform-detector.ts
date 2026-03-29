import type { Platform, PlatformInfo, PlatformFeatures } from '../types/platform';
import { PLATFORM_FEATURES } from '../types/platform';

declare global {
  interface Window {
    electron?: unknown;
  }
}

export function detect(): PlatformInfo {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const screenWidth = typeof screen !== 'undefined' ? screen.width : 0;
  const screenHeight = typeof screen !== 'undefined' ? screen.height : 0;
  const touchPoints = typeof navigator !== 'undefined' && 'maxTouchPoints' in navigator
    ? (navigator as { maxTouchPoints: number }).maxTouchPoints
    : 0;

  const platform = detectPlatform(userAgent, screenWidth, touchPoints);
  const features = PLATFORM_FEATURES[platform];

  return {
    platform,
    features,
    userAgent,
    screenWidth,
    screenHeight,
    touchPoints,
    isMobile: platform === 'pda' || platform === 'pad',
  };
}

function detectPlatform(userAgent: string, screenWidth: number, touchPoints: number): Platform {
  if (typeof window !== 'undefined' && window.electron) {
    return 'pc-client';
  }

  if (screenWidth < 480 && touchPoints > 0) {
    return 'pda';
  }

  if (screenWidth >= 481 && screenWidth <= 1024 && touchPoints > 0) {
    return 'pad';
  }

  if (screenWidth > 768 && touchPoints === 0 && /Mozilla/.test(userAgent)) {
    return 'pc-browser';
  }

  if (screenWidth > 768 && touchPoints === 0) {
    return 'pc-browser';
  }

  if (touchPoints > 0) {
    return 'pad';
  }

  return 'pc-browser';
}

export function getPlatform(): Platform {
  return detect().platform;
}

export function getPlatformFeatures(): PlatformFeatures {
  const platform = getPlatform();
  return PLATFORM_FEATURES[platform];
}

export function isPlatform(platform: Platform): boolean {
  return getPlatform() === platform;
}

export function isMobileDevice(): boolean {
  const platform = getPlatform();
  return platform === 'pda' || platform === 'pad';
}