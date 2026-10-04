export type LevelName = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export const LEVEL_VALUES: Record<LevelName, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
}

export const LEVEL_LABELS: Record<number, LevelName> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal'
}

export function parseLevel (level: LevelName | number): number {
  if (typeof level === 'number') {
    return level
  }
  return LEVEL_VALUES[level]
}
