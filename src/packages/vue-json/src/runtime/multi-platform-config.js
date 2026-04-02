import { getPlatform } from './platform-detector';
export function getPlatformConfig(config) {
    const platform = getPlatform();
    return config[platform];
}
export function filterMenuByPlatform(menu) {
    const platform = getPlatform();
    return menu.filter(item => {
        if (!item.platform)
            return true;
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
export function filterPagesByPlatform(pages) {
    const platform = getPlatform();
    return pages.filter(page => {
        if (!page.platform)
            return true;
        if (Array.isArray(page.platform)) {
            return page.platform.includes(platform);
        }
        return page.platform === platform;
    });
}
export function isPlatformEnabled(_feature) {
    const platform = getPlatform();
    const featureConfig = {
        'pc-browser': true,
        'pc-client': true,
        'pda': true,
        'pad': true,
    };
    return featureConfig[platform] ?? false;
}
export function getEntryPath(platformConfigs) {
    const platform = getPlatform();
    return platformConfigs[platform] || '/';
}
//# sourceMappingURL=multi-platform-config.js.map