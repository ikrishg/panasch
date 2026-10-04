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
  'credentials.*',
  'private_key',
  'client_secret'
]

export function pathMatches (path: string, pattern: string): boolean {
  const normalizedPath = path.toLowerCase()
  const normalizedPattern = pattern.toLowerCase()

  if (normalizedPattern.endsWith('.*')) {
    const prefix = normalizedPattern.slice(0, -2)
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}.`)
  }

  const patternParts = normalizedPattern.split('.')
  const pathParts = normalizedPath.split('.')

  if (patternParts.length === 1) {
    return pathParts[pathParts.length - 1] === patternParts[0] || normalizedPath === patternParts[0]
  }

  if (patternParts.length !== pathParts.length) {
    return false
  }

  return patternParts.every((part, index) => part === '*' || part === pathParts[index])
}

function isPlainRecord (value: unknown): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  if (value instanceof Error) {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function redactValue (
  value: unknown,
  path: string,
  patterns: string[],
  seen: WeakSet<object>
): unknown {
  if (value instanceof Error) {
    return redactObject(
      {
        type: value.name,
        message: value.message,
        stack: value.stack
      },
      path,
      patterns,
      seen
    )
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => redactValue(item, `${path}[${index}]`, patterns, seen))
  }

  if (isPlainRecord(value)) {
    return redactObject(value as Record<string, unknown>, path, patterns, seen)
  }

  return value
}

function redactObject (
  obj: Record<string, unknown>,
  prefix: string,
  patterns: string[],
  seen: WeakSet<object>
): Record<string, unknown> {
  if (seen.has(obj)) {
    return { '[Circular]': true }
  }
  seen.add(obj)

  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix === '' ? key : `${prefix}.${key}`
    const shouldRedact = patterns.some((pattern) => pathMatches(path, pattern))
    if (shouldRedact) {
      out[key] = '[Redacted]'
    } else {
      out[key] = redactValue(value, path, patterns, seen)
    }
  }
  return out
}

export function redactRecord (
  record: Record<string, unknown>,
  paths: string[] = DEFAULT_REDACT_PATHS
): Record<string, unknown> {
  return redactObject(record, '', paths, new WeakSet())
}
