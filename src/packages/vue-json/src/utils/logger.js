const LEVEL_PRIORITY = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
};
export class Logger {
    level;
    prefix;
    constructor(options = {}) {
        this.level = options.level ?? 'warn';
        this.prefix = options.prefix ?? '';
    }
    setLevel(level) {
        this.level = level;
    }
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    debug(message, ...args) {
        this.log('debug', message, args);
    }
    info(message, ...args) {
        this.log('info', message, args);
    }
    warn(message, ...args) {
        this.log('warn', message, args);
    }
    error(message, ...args) {
        this.log('error', message, args);
    }
    log(level, message, args) {
        if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) {
            return;
        }
        const prefix = this.prefix ? `[${this.prefix}] ` : '';
        const formattedMessage = `${prefix}${message}`;
        switch (level) {
            case 'debug':
                console.debug(formattedMessage, ...args);
                break;
            case 'info':
                console.info(formattedMessage, ...args);
                break;
            case 'warn':
                console.warn(formattedMessage, ...args);
                break;
            case 'error':
                console.error(formattedMessage, ...args);
                break;
        }
    }
}
const globalLogger = new Logger({ level: 'warn', prefix: 'vue-json-engine' });
export function getLogger(prefix) {
    if (prefix) {
        return new Logger({ level: globalLogger['level'], prefix });
    }
    return globalLogger;
}
export function setGlobalLogLevel(level) {
    globalLogger.setLevel(level);
}
//# sourceMappingURL=logger.js.map