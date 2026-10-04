import { getLogContext } from './context.js'
import { type LevelName, LEVEL_VALUES, parseLevel } from './levels.js'
import { getOtelTraceFields } from './otel.js'
import { DEFAULT_REDACT_PATHS } from './redact.js'
import { buildLogRecord, stringifyLogLine } from './serialize.js'
import { type LogSink, getDefaultSink } from './sink.js'

export type Bindings = Record<string, unknown>

export type LoggerOptions = {
  level?: LevelName | number
  name?: string
  redact?: string[] | false
  otel?: boolean
  sink?: LogSink
}

type LogMethod = {
  (msg: string): void
  (obj: Bindings, msg?: string): void
  (err: Error, msg?: string): void
}

export interface Logger {
  level: number
  bindings: Bindings
  trace: LogMethod
  debug: LogMethod
  info: LogMethod
  warn: LogMethod
  error: LogMethod
  fatal: LogMethod
  child: (bindings: Bindings) => Logger
}

export function createLogger (options: LoggerOptions = {}): Logger {
  const level = parseLevel(options.level ?? 'info')
  const bindings: Bindings = options.name !== undefined ? { name: options.name } : {}
  const redactPaths = options.redact === false ? [] : (options.redact ?? DEFAULT_REDACT_PATHS)
  const otel = options.otel ?? false
  const sink = options.sink ?? getDefaultSink()

  return buildLogger(bindings, level, redactPaths, otel, sink)
}

function buildLogger (
  bindings: Bindings,
  level: number,
  redactPaths: string[],
  otel: boolean,
  sink: LogSink
): Logger {
  const logger: Logger = {
    level,
    bindings,
    trace: createLogMethod('trace'),
    debug: createLogMethod('debug'),
    info: createLogMethod('info'),
    warn: createLogMethod('warn'),
    error: createLogMethod('error'),
    fatal: createLogMethod('fatal'),
    child (childBindings: Bindings) {
      return buildLogger(
        { ...bindings, ...childBindings },
        level,
        redactPaths,
        otel,
        sink
      )
    }
  }

  function createLogMethod (methodLevel: LevelName): LogMethod {
    const method = ((first: unknown, second?: string) => {
      if (LEVEL_VALUES[methodLevel] < level) {
        return
      }
      const { obj, msg } = normalizeArgs(first, second)
      const record = buildLogRecord(
        methodLevel,
        bindings,
        getLogContext(),
        getOtelTraceFields(otel),
        redactPaths,
        obj,
        msg
      )
      try {
        sink(stringifyLogLine(record))
      } catch {
        try {
          sink(stringifyLogLine({
            level: LEVEL_VALUES[methodLevel],
            time: Date.now(),
            msg: 'Failed to emit log record'
          }))
        } catch {
          // Never throw from logging.
        }
      }
    }) as LogMethod
    return method
  }

  return logger
}

function normalizeArgs (
  first: unknown,
  second?: string
): { obj: Bindings | undefined, msg: string | undefined } {
  if (first instanceof Error) {
    return {
      obj: { err: first },
      msg: second ?? first.message
    }
  }
  if (typeof first === 'object' && first !== null) {
    return {
      obj: first as Bindings,
      msg: second
    }
  }
  return {
    obj: undefined,
    msg: typeof first === 'string' ? first : String(first)
  }
}
