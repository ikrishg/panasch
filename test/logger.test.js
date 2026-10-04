import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createLogger, runWithContext } from '../dist/index.js'

describe('createLogger', () => {
  it('writes JSON with object-first pino shape', () => {
    const lines = []
    const log = createLogger({
      level: 'info',
      sink: (line) => { lines.push(line) }
    })
    log.info({ userId: 'u1' }, 'hello')
    assert.equal(lines.length, 1)
    const record = JSON.parse(lines[0])
    assert.equal(record.msg, 'hello')
    assert.equal(record.userId, 'u1')
    assert.equal(record.level, 30)
  })

  it('redacts secrets by default', () => {
    const lines = []
    const log = createLogger({ sink: (line) => { lines.push(line) } })
    log.info({ token: 'secret-value' }, 'auth')
    const record = JSON.parse(lines[0])
    assert.equal(record.token, '[Redacted]')
  })

  it('merges async context and correlation id', () => {
    const lines = []
    const log = createLogger({ sink: (line) => { lines.push(line) } })
    runWithContext({ requestId: 'r1' }, () => {
      log.info('in request')
    })
    const record = JSON.parse(lines[0])
    assert.equal(record.requestId, 'r1')
    assert.ok(typeof record.correlationId === 'string')
  })

  it('child() adds bindings', () => {
    const lines = []
    const log = createLogger({ sink: (line) => { lines.push(line) } })
    log.child({ service: 'worker' }).info('ok')
    const record = JSON.parse(lines[0])
    assert.equal(record.service, 'worker')
  })
})
