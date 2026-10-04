import { AsyncLocalStorage } from 'node:async_hooks'
import { type ContextRunner, setContextRunner } from '../context.js'

const storage = new AsyncLocalStorage<Record<string, unknown>>()

const nodeRunner: ContextRunner = {
  run<T> (store: Record<string, unknown>, fn: () => T): T {
    const parent = storage.getStore()
    const merged = parent === undefined ? store : { ...parent, ...store }
    return storage.run(merged, fn)
  },
  getStore () {
    return storage.getStore()
  }
}

/** Enable AsyncLocalStorage-backed context on Node.js (recommended for servers). */
export function installNodeContext (): void {
  setContextRunner(nodeRunner)
}

export { storage as nodeAsyncLocalStorage }
