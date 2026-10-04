export type LogContext = Record<string, unknown>

export interface ContextRunner {
  run: <T>(store: LogContext, fn: () => T) => T
  getStore: () => LogContext | undefined
}

let activeRunner: ContextRunner | undefined

/** Install async context propagation (call once; use `panasch/context/node` on Node). */
export function setContextRunner (runner: ContextRunner): void {
  activeRunner = runner
}

export function getContextRunner (): ContextRunner {
  if (activeRunner !== undefined) {
    return activeRunner
  }
  return fallbackRunner
}

const fallbackRunner: ContextRunner = {
  run<T> (store: LogContext, fn: () => T): T {
    const previous = fallbackStore
    fallbackStore = { ...previous, ...store }
    try {
      return fn()
    } finally {
      fallbackStore = previous
    }
  },
  getStore (): LogContext | undefined {
    return fallbackStore
  }
}

let fallbackStore: LogContext | undefined

export function createCorrelationId (): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `cid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function runWithContext<T> (context: LogContext, fn: () => T): T {
  const store = context.correlationId !== undefined
    ? context
    : { ...context, correlationId: createCorrelationId() }
  return getContextRunner().run(store, fn)
}

export function getLogContext (): LogContext {
  return getContextRunner().getStore() ?? {}
}
