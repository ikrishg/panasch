export type LogSink = (line: string) => void

const consoleSink: LogSink = (line) => {
  // eslint-disable-next-line no-console
  console.log(line)
}

export function getDefaultSink (): LogSink {
  return consoleSink
}
