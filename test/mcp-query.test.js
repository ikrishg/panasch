import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { queryLogs } from '../dist/mcp/query.js'

describe('queryLogs', () => {
  const rows = [
    { time: 1, level: 30, correlationId: 'a', msg: 'one' },
    { time: 2, level: 30, correlationId: 'b', msg: 'two' }
  ]

  it('filters with SQL-ish WHERE', () => {
    const result = queryLogs("SELECT * FROM logs WHERE correlationId = 'a' LIMIT 10", rows)
    assert.equal(result.rows.length, 1)
    assert.equal(result.rows[0].correlationId, 'a')
  })

  it('rejects unsupported SQL', () => {
    const result = queryLogs('DELETE FROM logs', rows)
    assert.ok(result.error)
  })
})
