import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createLogger } from '../dist/index.js'
import { pathMatches } from '../dist/redact.js'

describe('redaction', () => {
  it('matches credentials.* wildcard paths', () => {
    assert.equal(pathMatches('credentials.apiKey', 'credentials.*'), true)
    assert.equal(pathMatches('credentials.nested.token', 'credentials.*'), true)
  })

  it('redacts nested arrays', () => {
    const lines = []
    const log = createLogger({ sink: (line) => { lines.push(line) } })
    log.info({ batches: [[{ token: 'secret' }]] }, 'batched')
    const record = JSON.parse(lines[0])
    assert.equal(record.batches[0][0].token, '[Redacted]')
  })

  it('preserves Date values', () => {
    const lines = []
    const log = createLogger({ redact: false, sink: (line) => { lines.push(line) } })
    const when = new Date('2020-01-02T03:04:05.000Z')
    log.info({ when }, 'timed')
    const record = JSON.parse(lines[0])
    assert.equal(record.when, when.toISOString())
  })

  it('does not throw on circular payloads', () => {
    const lines = []
    const log = createLogger({ redact: false, sink: (line) => { lines.push(line) } })
    const circular = { name: 'loop' }
    circular.self = circular
    log.info(circular, 'circular')
    assert.equal(lines.length, 1)
    const record = JSON.parse(lines[0])
    assert.equal(record.name, 'loop')
    assert.equal(record.self.self['[Circular]'], true)
  })

  it('serializes bigint without throwing', () => {
    const lines = []
    const log = createLogger({ redact: false, sink: (line) => { lines.push(line) } })
    log.info({ value: 42n }, 'bigint')
    const record = JSON.parse(lines[0])
    assert.equal(record.value, '42')
  })
})
