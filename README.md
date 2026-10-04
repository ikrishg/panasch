# Panasch

Zero-dependency structured JSON logger for Node, Bun, Deno, and edge runtimes. Logs go to `console` (no worker threads, no transports). **Stage 1** ships Pino-style call shapes, async context with correlation IDs, redaction defaults, and an optional OpenTelemetry trace hook.

The **AI-native layer** (token-efficient sinks, `gen_ai.*` helpers, MCP log access) is planned but **not implemented in this release**.

## Install (local package)

Not published to npm under the Panasch name yet. Use a checkout:

```bash
git clone https://github.com/ikrishg/panasch.git
cd panasch
yarn install && yarn build
```

In another project:

```bash
npm install /path/to/panasch
```

The `package.json` name is still `trevenant` until a release is published.

## Quick start

```js
import { createLogger, runWithContext } from 'trevenant'
import { installNodeContext } from 'trevenant/context/node'

installNodeContext() // Node: context survives `await` via AsyncLocalStorage

const log = createLogger({ level: 'info', name: 'api' })

runWithContext({ requestId: 'req-1' }, () => {
  log.info({ userId: 'u1' }, 'fetched profile')
  log.child({ component: 'db' }).debug('query ok')
})
```

Each line is one JSON object. `runWithContext` adds a `correlationId` when you omit one. Context fields are merged into every log in that scope. On Bun, Deno, and edge runtimes without a custom context runner, install your runtime’s async context or avoid logging after `await` outside `runWithContext`’s synchronous body (the fallback runner keeps context until returned Promises settle).

## Pino-style API

```js
log.info('plain message')
log.info({ key: 'value' }, 'with object')
log.error(err, 'failed') // Error serialized under `err`
const child = log.child({ requestId: 'abc' })
```

## Redaction

Sensitive keys are redacted by default (`password`, `token`, `authorization`, `apiKey`, `secret`, and similar). Pass `redact: ['customField']` or `redact: false` to override.

## OpenTelemetry (optional)

Off unless you enable it. Panasch does not depend on the experimental OTel logs SDK—only an optional trace hook:

```js
import * as api from '@opentelemetry/api'
import { createLogger, setOtelTraceHook, createOpenTelemetryTraceHook } from 'trevenant'

setOtelTraceHook(createOpenTelemetryTraceHook(api))
const log = createLogger({ otel: true })
```

Install `@opentelemetry/api` in your app when you use this.

## Class API (`Panasch`)

`Panasch` / `Trevenant` remain as a thin chainable wrapper around the same core logger.

## License

MIT
