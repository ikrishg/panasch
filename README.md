# Panasch

Zero-dependency structured logger for Node, Bun, Deno, and edge runtimes. Logs go to `console` (no worker threads).

**Stage 1:** Pino-style calls, async context + correlation IDs, redaction defaults, optional OpenTelemetry trace hook.

**Stage 2 (shipped):** Token-efficient sinks (`logfmt`, `compact`), duplicate-line summarization, OpenTelemetry-shaped `gen_ai.*` logging helpers (with prompt redaction), in-memory log capture, and an MCP stdio server for SQL-ish queries from Cursor/Claude Code. Agent skill: `skills/panasch-logging/SKILL.md`.

**Later (Stage 3, not in this repo yet):** Pino/Winston codemod, playground, distribution launch assets, npm publish under the Panasch name.

## Install (local package)

```bash
git clone https://github.com/ikrishg/panasch.git
cd panasch
yarn install && yarn build
```

```bash
npm install /path/to/panasch
```

The `package.json` name is still `trevenant` until a release is published.

## Quick start

```js
import { createLogger, runWithContext } from 'trevenant'
import { installNodeContext } from 'trevenant/context/node'

installNodeContext()

const log = createLogger({ level: 'info', name: 'api' })

runWithContext({ requestId: 'req-1' }, () => {
  log.info({ userId: 'u1' }, 'fetched profile')
})
```

## Stage 2: token-efficient output

```js
const log = createLogger({
  format: 'logfmt', // or 'compact' | 'json'
  dedup: true,
  capture: true // buffer for MCP
})
```

Subpath API: `import { formatLogfmt, buildEmitPipeline } from 'trevenant/sinks'`

## Stage 2: gen_ai helpers

```js
import { logGenAiChat, logGenAiToolCall } from 'trevenant/ai'

logGenAiChat(log, {
  model: 'gpt-4',
  inputTokens: 120,
  outputTokens: 40,
  prompt: 'user text…' // redacted in output
})

logGenAiToolCall(log, {
  toolName: 'search',
  callId: 'call-1',
  arguments: { q: 'docs' }
})
```

Fields follow OpenTelemetry `gen_ai.*` naming (stable chat/usage attributes).

## Stage 2: MCP log server

Requires optional peer `@modelcontextprotocol/sdk` (included in dev install).

```bash
yarn build
# In your app: createLogger({ capture: true })
yarn mcp
```

Tools: `list_recent_logs`, `query_logs` with queries like:

`SELECT * FROM logs WHERE correlationId = 'req-1' LIMIT 20`

## Pino-style API, redaction, OpenTelemetry

See prior sections: `log.info(obj, msg)`, `child()`, default redaction, and `setOtelTraceHook` + `createOpenTelemetryTraceHook(api)` with `otel: true`.

## Class API (`Panasch`)

`Panasch` / `Trevenant` remain as a thin chainable wrapper.

## License

MIT
