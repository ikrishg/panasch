import { type LevelName, LEVEL_VALUES } from './levels.js'
import { redactRecord } from './redact.js'

export function serializeError (err: Error): Record<string, unknown> {
  return {
    type: err.name,
    message: err.message,
    stack: err.stack
  }
}

export function buildLogRecord (
  level: LevelName,
  bindings: Record<string, unknown>,
  context: Record<string, unknown>,
  otelFields: Record<string, unknown>,
  redactPaths: string[],
  obj: Record<string, unknown> | undefined,
  msg: string | undefined
): Record<string, unknown> {
  const merged: Record<string, unknown> = {
    ...bindings,
    ...context,
    ...otelFields,
    ...(obj ?? {}),
    level: LEVEL_VALUES[level],
    time: Date.now()
  }

  if (msg !== undefined && msg !== '') {
    merged.msg = msg
  }

  const err = merged.err
  if (err instanceof Error) {
    merged.err = serializeError(err)
  }

  return redactRecord(merged, redactPaths)
}

function jsonReplacer (_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  return value
}

export function stringifyLogLine (record: Record<string, unknown>): string {
  try {
    return JSON.stringify(record, jsonReplacer)
  } catch {
    return JSON.stringify({
      level: record.level ?? 50,
      time: record.time ?? Date.now(),
      msg: 'Failed to serialize log record',
      error: 'Unserializable payload'
    })
  }
}
