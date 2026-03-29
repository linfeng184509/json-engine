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

export const PLATFORM_FEATURES: Record<Platform, PlatformFeatures> = {
  'pc-browser': {
    fullscreen: true,
    print: true,
    export: true,
  },
  'pc-client': {
    fullscreen: true,
    print: true,
    export: true,
  },
  'pda': {
    scan: true,
    nfc: true,
    offline: true,
    touch: true,
    gps: true,
    camera: true,
    bluetooth: true,
  },
  'pad': {
    scan: true,
    nfc: true,
    offline: true,
    touch: true,
    gps: true,
    camera: true,
    bluetooth: true,
  },
};