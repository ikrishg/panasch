# Panasch

TypeScript-first, zero-runtime-dependency JSON logger for Node, Bun, Deno, and edge runtimes. **No worker threads** and no transport workers—logs serialize synchronously and write to `console` (or your sink) in-process.

![Panasch logging demo](docs/demo.gif)

## Why not Pino or Winston?

**Pino** is fast on long-lived Node servers, but its **worker-thread transports** do not fit short-lived and edge runtimes (Cloudflare Workers, Vercel Edge). Teams also report **lost or late logs on Lambda** when flushing async transports. Panasch avoids that failure mode by design: no background workers, no separate transport process, no flush race on process exit.

**Winston** brings a large transport ecosystem at the cost of bundle size, complexity, and uneven TypeScript ergonomics. Panasch targets the same structured JSON shape with a smaller surface and first-class TypeScript types.

See [ROADMAP.md](./ROADMAP.md) for phased delivery history and what is still planned.

## Install (local package)

Not published to npm yet. Use a checkout:

```bash
git clone https://github.com/ikrishg/panasch.git
cd panasch
yarn install && yarn build
```

```bash
npm install /path/to/panasch
```

## Quick start (TypeScript)

```typescript
import { createLogger, runWithContext } from 'panasch'
import { installNodeContext } from 'panasch/context/node'

installNodeContext() // Node servers: context survives await

const log = createLogger({ level: 'info', name: 'api' })

runWithContext({ requestId: 'req-1' }, () => {
  log.info({ userId: 'u1' }, 'fetched profile')
  log.child({ component: 'db' }).debug('query ok')
})
```

## Edge (Cloudflare Workers)

No `installNodeContext`—use `runWithContext` per request (fallback runner keeps context until returned Promises settle):

```typescript
import { createLogger, runWithContext } from 'panasch'

const log = createLogger({ name: 'worker' })

export default {
  fetch (request: Request): Response {
    return runWithContext({ requestId: crypto.randomUUID() }, () => {
      log.info({ path: new URL(request.url).pathname }, 'request')
      return new Response('ok')
    })
  }
}
```

## Deno

```typescript
import { createLogger, runWithContext } from 'npm:panasch@file:///path/to/panasch/dist/index.js'

const log = createLogger()
runWithContext({ jobId: '1' }, () => log.info('deno job'))
```

(Adjust the `npm:` path to your local checkout after `yarn build`.)

## Framework hooks (one line each)

**Hono:** `app.use('*', (c, next) => runWithContext({ requestId: c.req.header('x-request-id') ?? crypto.randomUUID() }, () => next()))`

**Fastify:** `fastify.addHook('onRequest', (req, _reply, done) => { runWithContext({ requestId: req.id }, done) })`

**Next.js (App Router middleware):** `return runWithContext({ requestId: request.headers.get('x-request-id') ?? crypto.randomUUID() }, () => NextResponse.next())`

## Pino API compatibility

| Supported | Notes |
|-----------|--------|
| `logger.info('msg')` | Same call shape |
| `logger.info({ key }, 'msg')` | Object-first |
| `logger.info(err, 'msg')` | `Error` → `err` field |
| `logger.child({ bindings })` | Merged bindings |
| Levels `trace` … `fatal` | Numeric `level` in JSON (Pino-compatible values) |

| Not supported | Notes |
|---------------|--------|
| `pino.transport()` / worker transports | Use Panasch sinks or your own `sink` |
| `pino.destination`, multistream | Single `sink` callback |
| Built-in `pino-pretty` | Use `format: 'logfmt'` or pretty in dev |
| Pino redact path syntax / serializers | Panasch redact list + `redactRecord` |
| `logger.level = 'debug'` mutator | Pass `level` to `createLogger` |

Migrate with `yarn codemod --from pino --write ./src` (review diffs).

## Benchmarks (measured)

Run yourself: `yarn build && node scripts/benchmark.mjs` (requires devDependency `pino`).  
Environment: Node **v22.14.0**, **200k** iterations per cell, Panasch → no-op sink, Pino → `/dev/null` stream. **2026-10-04.**

| Payload | Panasch ops/sec | Pino ops/sec |
|---------|-----------------|--------------|
| string message | 219,934 | 1,176,022 |
| flat object + msg | 118,981 | 904,195 |
| nested object + msg | 64,991 | 796,892 |

Panasch is slower here; the tradeoff is zero runtime deps, no worker threads, and the same code path on edge and Node. Raw JSON: [docs/benchmark-results.json](./docs/benchmark-results.json).

## Token-efficient output (Stage 2)

```typescript
const log = createLogger({ format: 'logfmt', dedup: true, capture: true })
```

## gen_ai helpers

```typescript
import { logGenAiChat } from 'panasch/ai'

logGenAiChat(log, { model: 'gpt-4', inputTokens: 120, outputTokens: 40, prompt: '…' })
```

## MCP log server

```bash
yarn mcp
```

Requires optional `@modelcontextprotocol/sdk` and `createLogger({ capture: true })`.

## OpenTelemetry

**Trace context only:** register `setOtelTraceHook(createOpenTelemetryTraceHook(api))` and `createLogger({ otel: true })`. Panasch does **not** ship an OTLP logs exporter or the experimental OTel Logs SDK.

## Codemod & playground

```bash
yarn codemod --from pino --write ./src
yarn playground   # http://localhost:4173/playground/
```

## Class API

```typescript
import { Panasch } from 'panasch'

const log = new Panasch()
log.info('hello').success('done')
```

## License

MIT
