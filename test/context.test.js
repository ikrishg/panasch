import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createLogger, runWithContext } from '../dist/index.js'
import { installNodeContext } from '../dist/context/node.js'

describe('runWithContext', () => {
  it('keeps fallback context until an async callback settles', async () => {
    const lines = []
    const log = createLogger({ sink: (line) => { lines.push(line) } })

    await runWithContext({ requestId: 'async-r1' }, async () => {
      await Promise.resolve()
      log.info('after await')
    })

    const record = JSON.parse(lines[0])
    assert.equal(record.requestId, 'async-r1')
    assert.ok(typeof record.correlationId === 'string')
  })

  it('keeps Node ALS context across await when installed', async () => {
    installNodeContext()
    const lines = []
    const log = createLogger({ sink: (line) => { lines.push(line) } })

    await runWithContext({ requestId: 'node-r1' }, async () => {
      await Promise.resolve()
      log.info('after await')
    })

    const record = JSON.parse(lines[0])
    assert.equal(record.requestId, 'node-r1')
  })
})
