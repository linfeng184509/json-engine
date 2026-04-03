import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, getLogger, setGlobalLogLevel } from '../../src/utils/logger';
import type { LogLevel } from '../../src/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log level filtering', () => {
    it('should output all messages when level is debug', () => {
      const logger = new Logger({ level: 'debug' });
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(console.debug).toHaveBeenCalledWith('debug msg');
      expect(console.info).toHaveBeenCalledWith('info msg');
      expect(console.warn).toHaveBeenCalledWith('warn msg');
      expect(console.error).toHaveBeenCalledWith('error msg');
    });

    it('should output info, warn, error when level is info', () => {
      const logger = new Logger({ level: 'info' });
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith('info msg');
      expect(console.warn).toHaveBeenCalledWith('warn msg');
      expect(console.error).toHaveBeenCalledWith('error msg');
    });

    it('should output only warn and error when level is warn', () => {
      const logger = new Logger({ level: 'warn' });
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('warn msg');
      expect(console.error).toHaveBeenCalledWith('error msg');
    });

    it('should output only error when level is error', () => {
      const logger = new Logger({ level: 'error' });
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('error msg');
    });

    it('should output nothing when level is silent', () => {
      const logger = new Logger({ level: 'silent' });
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should default to warn level', () => {
      const logger = new Logger();
      logger.debug('debug msg');
      logger.warn('warn msg');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('warn msg');
    });
  });

  describe('prefix', () => {
    it('should add prefix to messages', () => {
      const logger = new Logger({ level: 'debug', prefix: 'MyModule' });
      logger.debug('test');

      expect(console.debug).toHaveBeenCalledWith('[MyModule] test');
    });

    it('should not add prefix when prefix is empty', () => {
      const logger = new Logger({ level: 'debug', prefix: '' });
      logger.debug('test');

      expect(console.debug).toHaveBeenCalledWith('test');
    });

    it('should set prefix after construction', () => {
      const logger = new Logger({ level: 'debug' });
      logger.setPrefix('NewPrefix');
      logger.debug('test');

      expect(console.debug).toHaveBeenCalledWith('[NewPrefix] test');
    });
  });

  describe('setLevel', () => {
    it('should change log level dynamically', () => {
      const logger = new Logger({ level: 'warn' });
      logger.info('before');
      expect(console.info).not.toHaveBeenCalled();

      logger.setLevel('debug');
      logger.info('after');
      expect(console.info).toHaveBeenCalledWith('after');
    });

    it('should allow setting all levels', () => {
      const logger = new Logger({ level: 'silent' });
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

      for (const level of levels) {
        logger.setLevel(level);
        logger.debug('d');
        logger.info('i');
        logger.warn('w');
        logger.error('e');
      }
    });
  });

  describe('args passthrough', () => {
    it('should pass additional args to console methods', () => {
      const logger = new Logger({ level: 'debug' });
      logger.debug('msg', { data: 1 });
      logger.info('msg', 'extra');
      logger.warn('msg', 123, true);
      logger.error('msg', new Error('test'));

      expect(console.debug).toHaveBeenCalledWith('msg', { data: 1 });
      expect(console.info).toHaveBeenCalledWith('msg', 'extra');
      expect(console.warn).toHaveBeenCalledWith('msg', 123, true);
      expect(console.error).toHaveBeenCalledWith('msg', expect.any(Error));
    });
  });
});

describe('getLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the global logger when no prefix is given', () => {
    const logger1 = getLogger();
    const logger2 = getLogger();
    expect(logger1).toBe(logger2);
  });

  it('should return a new logger with prefix when prefix is given', () => {
    const logger = getLogger('MyPrefix');
    logger.warn('test');

    expect(console.warn).toHaveBeenCalledWith('[MyPrefix] test');
  });

  it('should inherit global log level for prefixed loggers', () => {
    setGlobalLogLevel('debug');
    const logger = getLogger('Test');
    logger.debug('debug msg');

    expect(console.debug).toHaveBeenCalledWith('[Test] debug msg');

    setGlobalLogLevel('warn');
  });
});

describe('setGlobalLogLevel', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setGlobalLogLevel('warn');
  });

  it('should change the global logger level', () => {
    setGlobalLogLevel('debug');
    const logger = getLogger();
    logger.debug('test');

    expect(console.debug).toHaveBeenCalledWith('[vue-json-engine] test');
  });

  it('should affect all calls to getLogger without prefix', () => {
    setGlobalLogLevel('debug');
    getLogger().debug('msg1');
    getLogger().debug('msg2');

    expect(console.debug).toHaveBeenCalledTimes(2);
  });
});
