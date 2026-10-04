import { getLogContext } from './context.js'
import { type LevelName, LEVEL_VALUES, parseLevel } from './levels.js'
import { getOtelTraceFields } from './otel.js'
import { DEFAULT_REDACT_PATHS } from './redact.js'
import { buildLogRecord, stringifyLogLine } from './serialize.js'
import { type LogSink, getDefaultSink } from './sink.js'
import { buildEmitPipeline, type DedupOptions, type LogFormat } from './sinks/index.js'

export type Bindings = Record<string, unknown>

export type LoggerOptions = {
  level?: LevelName | number
  name?: string
  redact?: string[] | false
  otel?: boolean
  sink?: LogSink
  /** Token-efficient output format (default `json`). */
  format?: LogFormat
  /** Summarize consecutive duplicate lines. */
  dedup?: boolean | DedupOptions
  /** Keep recent records in memory for the MCP log server. */
  capture?: boolean
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
  const usePipeline = options.format !== undefined || options.dedup !== undefined || options.capture === true
  const emit = usePipeline
    ? buildEmitPipeline({
        format: options.format,
        dedup: options.dedup,
        capture: options.capture,
        sink
      })
    : undefined

  return buildLogger(bindings, level, redactPaths, otel, sink, emit)
}

function buildLogger (
  bindings: Bindings,
  level: number,
  redactPaths: string[],
  otel: boolean,
  sink: LogSink,
  emit?: (record: Record<string, unknown>) => void
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
        sink,
        emit
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
        if (emit !== undefined) {
          emit(record)
        } else {
          sink(stringifyLogLine(record))
        }
      } catch {
        try {
          const fallback = stringifyLogLine({
            level: LEVEL_VALUES[methodLevel],
            time: Date.now(),
            msg: 'Failed to emit log record'
          })
          if (emit !== undefined) {
            emit(JSON.parse(fallback) as Record<string, unknown>)
          } else {
            sink(fallback)
          }
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
