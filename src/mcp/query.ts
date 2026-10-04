import type { StoredLogRecord } from '../sinks/buffer.js'

export type LogQueryResult = {
  rows: StoredLogRecord[]
  error?: string
}

type Predicate = {
  field: string
  value: string | number | boolean
}

function parseWhere (clause: string): Predicate[] {
  const predicates: Predicate[] = []
  const parts = clause.split(/\s+AND\s+/i)
  for (const part of parts) {
    const match = part.trim().match(/^([a-zA-Z0-9_.]+)\s*=\s*(.+)$/)
    if (match === null) {
      continue
    }
    const field = match[1]
    let raw = match[2].trim()
    if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
      raw = raw.slice(1, -1)
      predicates.push({ field, value: raw })
      continue
    }
    if (raw === 'true' || raw === 'false') {
      predicates.push({ field, value: raw === 'true' })
      continue
    }
    const num = Number(raw)
    if (!Number.isNaN(num)) {
      predicates.push({ field, value: num })
      continue
    }
    predicates.push({ field, value: raw })
  }
  return predicates
}

function getField (row: StoredLogRecord, field: string): unknown {
  if (field in row) {
    return row[field]
  }
  return undefined
}

function matches (row: StoredLogRecord, predicates: Predicate[]): boolean {
  return predicates.every((p) => {
    const actual = getField(row, p.field)
    return actual === p.value || String(actual) === String(p.value)
  })
}

/**
 * Minimal SQL-ish filter: `SELECT * FROM logs WHERE correlationId = 'abc' LIMIT 10`
 */
export function queryLogs (sql: string, rows: readonly StoredLogRecord[]): LogQueryResult {
  const normalized = sql.trim().replace(/\s+/g, ' ')
  const match = normalized.match(/^SELECT\s+\*\s+FROM\s+logs(?:\s+WHERE\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i)
  if (match === null) {
    return {
      rows: [],
      error: 'Only `SELECT * FROM logs [WHERE ...] [LIMIT n]` is supported'
    }
  }

  const whereClause = match[1]
  const limit = match[2] !== undefined ? Number(match[2]) : 50
  let filtered = [...rows]
  if (whereClause !== undefined && whereClause.length > 0) {
    const predicates = parseWhere(whereClause)
    if (predicates.length === 0) {
      return { rows: [], error: 'Could not parse WHERE clause' }
    }
    filtered = filtered.filter((row) => matches(row, predicates))
  }

  return { rows: filtered.slice(-limit) }
}
