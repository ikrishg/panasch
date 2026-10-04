import { createLogger, type Logger, type LoggerOptions } from './logger.js'

export { createLogger, type Logger, type LoggerOptions }
export {
  runWithContext,
  getLogContext,
  createCorrelationId,
  setContextRunner,
  type LogContext,
  type ContextRunner
} from './context.js'
export { DEFAULT_REDACT_PATHS, redactRecord } from './redact.js'
export {
  setOtelTraceHook,
  createOpenTelemetryTraceHook,
  type OtelTraceHook
} from './otel.js'
export { getDefaultSink, type LogSink } from './sink.js'
export { type LevelName, LEVEL_VALUES } from './levels.js'

/** Trevenant-era class wrapper with chainable helpers; delegates to the core logger. */
export class Panasch {
  private readonly _logger: Logger

  constructor (options: LoggerOptions = {}) {
    this._logger = createLogger(options)
  }

  child (bindings: Record<string, unknown>): Panasch {
    const panasch = Object.create(Panasch.prototype) as Panasch
    Object.defineProperty(panasch, '_logger', {
      value: this._logger.child(bindings),
      enumerable: false
    })
    return panasch
  }

  debug (message: unknown, ...args: unknown[]): this {
    this.write('debug', message, ...args)
    return this
  }

  info (message: unknown, ...args: unknown[]): this {
    this.write('info', message, ...args)
    return this
  }

  warn (message: unknown, ...args: unknown[]): this {
    this.write('warn', message, ...args)
    return this
  }

  error (message: unknown, ...args: unknown[]): this {
    this.write('error', message, ...args)
    return this
  }

  fatal (message: unknown, ...args: unknown[]): this {
    this.write('fatal', message, ...args)
    return this
  }

  success (message: unknown, ...args: unknown[]): this {
    if (message instanceof Error) {
      this._logger.info({ err: message, success: true }, args[0] as string | undefined ?? message.message)
      return this
    }
    if (typeof message === 'object' && message !== null) {
      this._logger.info({ ...(message as Record<string, unknown>), success: true }, args[0] as string | undefined)
      return this
    }
    this._logger.info({ success: true }, String(message))
    return this
  }

  private write (level: 'debug' | 'info' | 'warn' | 'error' | 'fatal', message: unknown, ...args: unknown[]): void {
    const msg = args[0] as string | undefined
    if (message instanceof Error) {
      this._logger[level](message, msg)
      return
    }
    if (typeof message === 'object' && message !== null) {
      this._logger[level](message as Record<string, unknown>, msg)
      return
    }
    this._logger[level](String(message))
  }
}

/** @deprecated Use {@link Panasch} or {@link createLogger}. */
export const Trevenant = Panasch

export default Panasch
