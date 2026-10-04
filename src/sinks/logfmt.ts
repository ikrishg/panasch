function escapeLogfmtValue (value: string): string {
  if (/[\s="\\]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return value
}

function stringifyField (value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'object') {
    return escapeLogfmtValue(JSON.stringify(value))
  }
  return escapeLogfmtValue(String(value))
}

export function formatLogfmt (record: Record<string, unknown>): string {
  return Object.entries(record)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${stringifyField(value)}`)
    .join(' ')
}
