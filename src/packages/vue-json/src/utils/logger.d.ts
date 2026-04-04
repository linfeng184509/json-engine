export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export interface LoggerOptions {
    level?: LogLevel;
    prefix?: string;
}
export declare class Logger {
    private level;
    private prefix;
    constructor(options?: LoggerOptions);
    setLevel(level: LogLevel): void;
    setPrefix(prefix: string): void;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    private log;
}
export declare function getLogger(prefix?: string): Logger;
export declare function setGlobalLogLevel(level: LogLevel): void;
//# sourceMappingURL=logger.d.ts.map