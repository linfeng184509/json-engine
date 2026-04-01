interface ParseTrace {
  path: string;
  input: unknown;
  output: unknown;
  parser: string;
  duration: number;
  timestamp: number;
}

interface TraceContext {
  path: string;
  input: unknown;
  parser: string;
  startTime: number;
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface DebugOptions {
  enabled: boolean;
  logLevel?: LogLevel;
  onTrace?: (trace: ParseTrace) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class DebugTracer {
  private traces: ParseTrace[] = [];
  private enabled: boolean;
  private logLevel: LogLevel;
  private onTrace?: (trace: ParseTrace) => void;

  constructor(options: DebugOptions = { enabled: false }) {
    this.enabled = options.enabled;
    this.logLevel = options.logLevel ?? 'info';
    this.onTrace = options.onTrace;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data ?? '');
        break;
      case 'warn':
        console.warn(prefix, message, data ?? '');
        break;
      case 'info':
        console.info(prefix, message, data ?? '');
        break;
      case 'debug':
        console.debug(prefix, message, data ?? '');
        break;
    }
  }

  startTrace(path: string, input: unknown, parser: string = 'unknown'): TraceContext {
    if (!this.enabled) {
      return { path, input, parser, startTime: 0 };
    }

    const context: TraceContext = {
      path,
      input,
      parser,
      startTime: performance.now(),
    };

    this.log('debug', `Parse started: ${path}`, { parser, input });
    return context;
  }

  endTrace(context: TraceContext, output: unknown): void {
    if (!this.enabled) return;

    const duration = performance.now() - context.startTime;
    const trace: ParseTrace = {
      path: context.path,
      input: context.input,
      output,
      parser: context.parser,
      duration,
      timestamp: Date.now(),
    };

    this.traces.push(trace);
    this.log('debug', `Parse completed: ${context.path}`, { duration: `${duration.toFixed(2)}ms`, output });

    if (this.onTrace) {
      this.onTrace(trace);
    }
  }

  errorTrace(path: string, input: unknown, error: unknown, parser: string = 'unknown'): void {
    if (!this.enabled) return;

    const trace: ParseTrace = {
      path,
      input,
      output: error,
      parser,
      duration: 0,
      timestamp: Date.now(),
    };

    this.traces.push(trace);
    this.log('error', `Parse error: ${path}`, { parser, error });

    if (this.onTrace) {
      this.onTrace(trace);
    }
  }

  getTraces(): ParseTrace[] {
    return [...this.traces];
  }

  getTracesByPath(path: string): ParseTrace[] {
    return this.traces.filter(trace => trace.path === path);
  }

  getTracesByParser(parser: string): ParseTrace[] {
    return this.traces.filter(trace => trace.parser === parser);
  }

  getSlowTraces(thresholdMs: number = 10): ParseTrace[] {
    return this.traces.filter(trace => trace.duration > thresholdMs);
  }

  getTotalDuration(): number {
    return this.traces.reduce((total, trace) => total + trace.duration, 0);
  }

  getAverageDuration(): number {
    if (this.traces.length === 0) return 0;
    return this.getTotalDuration() / this.traces.length;
  }

  clear(): void {
    this.traces = [];
  }

  size(): number {
    return this.traces.length;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setOnTrace(callback: (trace: ParseTrace) => void): void {
    this.onTrace = callback;
  }

  exportTraces(): string {
    return JSON.stringify(this.traces, null, 2);
  }

  importTraces(json: string): void {
    try {
      const imported = JSON.parse(json) as ParseTrace[];
      this.traces = [...this.traces, ...imported];
    } catch {
      this.log('error', 'Failed to import traces: invalid JSON');
    }
  }
}

function createDebugTracer(options?: DebugOptions): DebugTracer {
  return new DebugTracer(options);
}

export {
  DebugTracer,
  createDebugTracer,
};

export type {
  ParseTrace,
  TraceContext,
  LogLevel,
  DebugOptions,
};
