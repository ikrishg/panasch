import pino, { type Level, type Logger, type LoggerOptions } from 'pino'
import { loadOtelMixin } from './otel'

export type PanaschOptions = {
  /** Minimum log level (default: `info`). */
  level?: Level
  /** Human-readable output instead of JSON lines (default: `false`). */
  pretty?: boolean
  /** Include active OpenTelemetry trace/span IDs in each log line (default: `false`). */
  otel?: boolean
  /** Extra options forwarded to the underlying pino instance. */
  pino?: LoggerOptions
}

export type PanaschLogger = (message: unknown, ...args: unknown[]) => Panasch

export class Panasch {
  private readonly _logger: Logger

  readonly debug: PanaschLogger
  readonly info: PanaschLogger
  readonly warn: PanaschLogger
  readonly error: PanaschLogger
  readonly fatal: PanaschLogger
  readonly success: PanaschLogger

  constructor (options: PanaschOptions = {}) {
    const {
      level = 'info',
      pretty = false,
      otel = false,
      pino: pinoOptions = {}
    } = options

    const baseOptions: LoggerOptions = {
      level,
      ...pinoOptions
    }

    if (otel) {
      baseOptions.mixin = loadOtelMixin()
    }

    if (pretty) {
      this._logger = pino({
        ...baseOptions,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      })
    } else {
      this._logger = pino(baseOptions)
    }

    this.debug = (message, ...args) => this.write('debug', message, ...args)
    this.info = (message, ...args) => this.write('info', message, ...args)
    this.warn = (message, ...args) => this.write('warn', message, ...args)
    this.error = (message, ...args) => this.write('error', message, ...args)
    this.fatal = (message, ...args) => this.write('fatal', message, ...args)
    this.success = (message, ...args) => this.writeSuccess(message, ...args)
  }

  private write (level: Level, message: unknown, ...args: unknown[]): Panasch {
    this.writeOn(this._logger, level, message, ...args)
    return this
  }

  private writeSuccess (message: unknown, ...args: unknown[]): Panasch {
    this.writeSuccessOn(this._logger, message, ...args)
    return this
  }

  private writeOn (
    logger: Logger,
    level: Level,
    message: unknown,
    ...args: unknown[]
  ): Panasch {
    if (message instanceof Error) {
      logger[level]({ err: message }, message.message)
      return this
    }

    if (typeof message === 'object' && message !== null) {
      logger[level](message as Record<string, unknown>, ...args as [string?])
      return this
    }

    logger[level](message as string, ...args as [])
    return this
  }

  private writeSuccessOn (
    logger: Logger,
    message: unknown,
    ...args: unknown[]
  ): Panasch {
    if (message instanceof Error) {
      logger.info({ err: message, success: true }, message.message)
      return this
    }

    if (typeof message === 'object' && message !== null) {
      logger.info({ ...(message as Record<string, unknown>), success: true }, ...args as [string?])
      return this
    }

    logger.info({ success: true }, message as string, ...args as [])
    return this
  }
}

/** @deprecated Use {@link Panasch} — retained for callers still importing the old name. */
export const Trevenant = Panasch

export default Panasch
