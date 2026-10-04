import { getDefaultSink, type LogSink } from '../sink.js'
import { appendLogRecord } from './buffer.js'
import { createDedupSink, type DedupOptions } from './dedup.js'
import { formatCompact } from './compact.js'
import { formatLogfmt } from './logfmt.js'
import { formatLogLine, type LogFormat } from './format.js'

export { formatLogfmt, formatCompact, formatLogLine, type LogFormat }
export { createDedupSink, type DedupOptions }
export {
  appendLogRecord,
  configureLogBuffer,
  getLogBuffer,
  clearLogBuffer,
  type StoredLogRecord
} from './buffer.js'

export type EmitPipelineOptions = {
  format?: LogFormat
  dedup?: boolean | DedupOptions
  capture?: boolean
  sink?: LogSink
}

/** Format a record, optionally dedupe lines, capture for MCP, and write to the sink. */
export function buildEmitPipeline (options: EmitPipelineOptions = {}): (record: Record<string, unknown>) => void {
  const format = options.format ?? 'json'
  const baseSink = options.sink ?? getDefaultSink()
  const lineSink = options.dedup === true || typeof options.dedup === 'object'
    ? createDedupSink(baseSink, typeof options.dedup === 'object' ? options.dedup : {})
    : baseSink
  const capture = options.capture ?? false

  return (record: Record<string, unknown>) => {
    if (capture) {
      appendLogRecord(record)
    }
    lineSink(formatLogLine(record, format))
  }
}
