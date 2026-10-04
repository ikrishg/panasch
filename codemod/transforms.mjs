/**
 * Best-effort source transforms for migrating common Pino/Winston patterns to Panasch.
 * Review the diff before committing — not every API maps 1:1.
 */

export function migrateFromPino (source) {
  let out = source

  out = out.replace(
    /import\s+pino\s+from\s+['"]pino['"]\s*;?/g,
    "import { createLogger } from 'panasch';"
  )
  out = out.replace(
    /import\s*\{\s*pino\s*\}\s*from\s+['"]pino['"]\s*;?/g,
    "import { createLogger } from 'panasch';"
  )
  out = out.replace(
    /const\s+(\w+)\s*=\s*pino\s*\(/g,
    'const $1 = createLogger('
  )
  out = out.replace(
    /let\s+(\w+)\s*=\s*pino\s*\(/g,
    'let $1 = createLogger('
  )
  out = out.replace(
    /=\s*pino\s*\(\s*\)/g,
    '= createLogger()'
  )

  return out
}

export function migrateFromWinston (source) {
  let out = source

  out = out.replace(
    /import\s+winston\s+from\s+['"]winston['"]\s*;?/g,
    "import { createLogger } from 'panasch';"
  )
  out = out.replace(
    /import\s*\{\s*createLogger\s+as\s+winstonCreateLogger\s*\}\s*from\s+['"]winston['"]\s*;?/g,
    "import { createLogger } from 'panasch';"
  )
  out = out.replace(
    /winston\.createLogger\s*\(/g,
    'createLogger('
  )
  out = out.replace(
    /const\s+(\w+)\s*=\s*winston\.createLogger\s*\(/g,
    'const $1 = createLogger('
  )

  return out
}

export function migrateSource (source, { from = 'pino' } = {}) {
  if (from === 'winston') {
    return migrateFromWinston(migrateFromPino(source))
  }
  return migrateFromPino(source)
}
