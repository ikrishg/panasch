#!/usr/bin/env node
/**
 * Compare Panasch vs Pino (devDependency) with a no-op sink.
 * Run: yarn build && node scripts/benchmark.mjs
 */
import { performance } from 'node:perf_hooks'
import { createWriteStream } from 'node:fs'
import { createLogger } from '../dist/index.js'
import pino from 'pino'

const ITERATIONS = 200_000
const warmup = 5_000

const payloads = {
  string: () => ['hello world'],
  flat: () => [{ userId: 'u1', route: '/api' }, 'request'],
  nested: () => [{ user: { id: 'u1', roles: ['a', 'b'] }, meta: { trace: 't' } }, 'nested']
}

function bench (name, fn) {
  for (let i = 0; i < warmup; i++) fn()
  const start = performance.now()
  for (let i = 0; i < ITERATIONS; i++) fn()
  const elapsed = performance.now() - start
  const opsPerSec = Math.round((ITERATIONS / elapsed) * 1000)
  return { name, opsPerSec, elapsedMs: Math.round(elapsed) }
}

// Discard writes (fair vs pino destination)
const discard = createWriteStream('/dev/null')
const panaschSink = () => {}
const panaschLog = createLogger({ sink: panaschSink })
const pinoLog = pino({ level: 'info' }, discard)

const rows = []
for (const [label, argsFn] of Object.entries(payloads)) {
  const args = argsFn()
  rows.push(bench(`panasch:${label}`, () => {
    if (args.length === 1) panaschLog.info(args[0])
    else panaschLog.info(args[0], args[1])
  }))
  rows.push(bench(`pino:${label}`, () => {
    if (args.length === 1) pinoLog.info(args[0])
    else pinoLog.info(args[0], args[1])
  }))
}

console.log(JSON.stringify({
  node: process.version,
  iterations: ITERATIONS,
  sink: 'no-op (panasch) vs /dev/null stream (pino)',
  rows
}, null, 2))
