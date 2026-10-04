import { stringifyLogLine } from '../serialize.js'
import { formatCompact } from './compact.js'
import { formatLogfmt } from './logfmt.js'

export type LogFormat = 'json' | 'logfmt' | 'compact'

export function formatLogLine (record: Record<string, unknown>, format: LogFormat = 'json'): string {
  switch (format) {
    case 'logfmt':
      return formatLogfmt(record)
    case 'compact':
      return formatCompact(record)
    default:
      return stringifyLogLine(record)
  }
}
