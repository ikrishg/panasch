#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { migrateSource } from './transforms.mjs'

const args = process.argv.slice(2)
let from = 'pino'
let write = false
const paths = []

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--from' && args[i + 1]) {
    from = args[++i]
  } else if (arg === '--write') {
    write = true
  } else if (arg === '--help' || arg === '-h') {
    console.log(`Usage: panasch-codemod [--from pino|winston] [--write] <files-or-dirs>`)
    process.exit(0)
  } else {
    paths.push(arg)
  }
}

if (paths.length === 0) {
  console.error('Provide at least one file or directory path.')
  process.exit(1)
}

const extensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx'])

function collectFiles (entry) {
  const stat = statSync(entry)
  if (stat.isFile()) {
    return extensions.has(extname(entry)) ? [entry] : []
  }
  const files = []
  for (const name of readdirSync(entry)) {
    if (name === 'node_modules' || name === 'dist') {
      continue
    }
    files.push(...collectFiles(join(entry, name)))
  }
  return files
}

let changed = 0
for (const path of paths) {
  for (const file of collectFiles(path)) {
    const before = readFileSync(file, 'utf8')
    const after = migrateSource(before, { from })
    if (after !== before) {
      changed += 1
      if (write) {
        writeFileSync(file, after)
        console.log(`updated ${file}`)
      } else {
        console.log(`--- ${file}`)
        console.log(after)
      }
    }
  }
}

if (changed === 0) {
  console.log('No files matched migration patterns.')
}
