/** Pipe-delimited key/value line (fewer tokens than JSON for flat records). */
export function formatCompact (record: Record<string, unknown>): string {
  const keys = Object.keys(record).sort()
  const parts: string[] = []
  for (const key of keys) {
    const value = record[key]
    if (value === undefined) {
      continue
    }
    parts.push(key, serializeCompactValue(value))
  }
  return parts.join('|')
}

function serializeCompactValue (value: unknown): string {
  if (value === null) {
    return 'null'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value).replace(/\|/g, '\\|')
}
