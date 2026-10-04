export type StoredLogRecord = Record<string, unknown> & {
  time: number
  level: number
}

const DEFAULT_CAPACITY = 2_000

let buffer: StoredLogRecord[] = []
let capacity = DEFAULT_CAPACITY

export function configureLogBuffer (options: { capacity?: number }): void {
  if (options.capacity !== undefined) {
    capacity = options.capacity
    if (buffer.length > capacity) {
      buffer = buffer.slice(buffer.length - capacity)
    }
  }
}

export function appendLogRecord (record: Record<string, unknown>): void {
  const entry = { ...record } as StoredLogRecord
  if (typeof entry.time !== 'number') {
    entry.time = Date.now()
  }
  if (typeof entry.level !== 'number') {
    entry.level = 30
  }
  buffer.push(entry)
  if (buffer.length > capacity) {
    buffer = buffer.slice(buffer.length - capacity)
  }
}

export function getLogBuffer (): readonly StoredLogRecord[] {
  return buffer
}

export function clearLogBuffer (): void {
  buffer = []
}
