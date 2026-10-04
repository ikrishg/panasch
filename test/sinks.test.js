import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createLogger } from '../dist/index.js'
import { formatLogfmt, formatCompact, clearLogBuffer, getLogBuffer } from '../dist/sinks/index.js'

describe('sinks', () => {
  it('formats logfmt and compact', () => {
    const record = { level: 30, msg: 'hi', userId: 'u1' }
    assert.match(formatLogfmt(record), /msg=hi/)
    assert.match(formatCompact(record), /\|hi\|/)
  })

  it('deduplicates repetitive lines', () => {
    const lines = []
    const log = createLogger({
      dedup: { summarizeAfter: 2 },
      sink: (line) => { lines.push(line) }
    })
    log.info('same')
    log.info('same')
    log.info('same')
    assert.ok(lines.length >= 2)
    assert.ok(lines.some((line) => line.includes('duplicate') || line.includes('Suppressed')))
  })

  it('captures records for MCP', () => {
    clearLogBuffer()
    const log = createLogger({ capture: true, sink: () => {} })
    log.info({ requestId: 'r-mcp' }, 'captured')
    const rows = getLogBuffer()
    assert.equal(rows.length, 1)
    assert.equal(rows[0].requestId, 'r-mcp')
  })
})
