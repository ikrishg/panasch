export const DEFAULT_REDACT_PATHS = [
  'password',
  'passwd',
  'secret',
  'token',
  'authorization',
  'auth',
  'apiKey',
  'api_key',
  'access_token',
  'refresh_token',
  'cookie',
  'set-cookie',
  'credentials',
  'private_key',
  'client_secret'
]

function pathMatches (path: string, pattern: string): boolean {
  const normalized = pattern.toLowerCase()
  const segments = path.toLowerCase().split('.')
  if (normalized.includes('*')) {
    const suffix = normalized.replace(/^\*\./, '')
    return segments.some((segment) => segment === suffix)
  }
  return segments[segments.length - 1] === normalized || path.toLowerCase() === normalized
}

function redactValue (value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item))
  }
  if (value !== null && typeof value === 'object') {
    return redactObject(value as Record<string, unknown>, '', [])
  }
  return value
}

function redactObject (
  obj: Record<string, unknown>,
  prefix: string,
  patterns: string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix === '' ? key : `${prefix}.${key}`
    const shouldRedact = patterns.some((pattern) => pathMatches(path, pattern))
    if (shouldRedact) {
      out[key] = '[Redacted]'
      continue
    }
    if (value !== null && typeof value === 'object' && !(value instanceof Error)) {
      if (Array.isArray(value)) {
        out[key] = value.map((item) =>
          item !== null && typeof item === 'object' && !Array.isArray(item)
            ? redactObject(item as Record<string, unknown>, path, patterns)
            : item
        )
      } else {
        out[key] = redactObject(value as Record<string, unknown>, path, patterns)
      }
    } else {
      out[key] = value
    }
  }
  return out
}

export function redactRecord (
  record: Record<string, unknown>,
  paths: string[] = DEFAULT_REDACT_PATHS
): Record<string, unknown> {
  return redactObject(record, '', paths)
}
