import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { migrateFromPino, migrateFromWinston, migrateSource } from '../codemod/transforms.mjs'

describe('codemod', () => {
  it('rewrites pino default import', () => {
    const input = "import pino from 'pino'\nconst log = pino()\n"
    const out = migrateFromPino(input)
    assert.match(out, /createLogger/)
    assert.doesNotMatch(out, /from 'pino'/)
  })

  it('rewrites winston createLogger', () => {
    const input = "import winston from 'winston'\nconst log = winston.createLogger({ level: 'info' })\n"
    const out = migrateFromWinston(input)
    assert.match(out, /import \{ createLogger \} from 'trevenant'/)
    assert.match(out, /const log = createLogger/)
  })

  it('supports combined migration', () => {
    const input = "import pino from 'pino'\nimport winston from 'winston'\n"
    const out = migrateSource(input, { from: 'winston' })
    assert.equal((out.match(/trevenant/g) ?? []).length, 2)
  })
})
