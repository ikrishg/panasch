import type { LogSink } from '../sink.js'

export type DedupOptions = {
  /** Emit a summary after this many identical consecutive lines (default: 5). */
  summarizeAfter?: number
}

export function createDedupSink (inner: LogSink, options: DedupOptions = {}): LogSink {
  const summarizeAfter = options.summarizeAfter ?? 5
  let lastLine = ''
  let repeatCount = 0
  let summarized = false

  return (line: string) => {
    if (line === lastLine) {
      repeatCount += 1
      if (repeatCount < summarizeAfter) {
        inner(line)
        return
      }
      if (!summarized) {
        summarized = true
        inner(JSON.stringify({
          level: 30,
          time: Date.now(),
          msg: `Suppressed ${repeatCount - summarizeAfter + 1} duplicate log lines`,
          dedup: { repeats: repeatCount, sample: line.slice(0, 200) }
        }))
      }
      return
    }

    lastLine = line
    repeatCount = 1
    summarized = false
    inner(line)
  }
}
