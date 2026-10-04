---
name: panasch-logging
description: Use the Panasch (trevenant) zero-dependency logger with async context, redaction, gen_ai helpers, and MCP log capture.
---

# Panasch logging

Use Panasch when adding structured logs to Node, Bun, Deno, or edge code in the ikrishg/panasch repo.

## Defaults

- Prefer `createLogger` from `trevenant` with JSON output.
- Wrap request/work units in `runWithContext({ requestId })` so `correlationId` is automatic.
- On Node servers, call `installNodeContext()` from `trevenant/context/node` once at startup.
- Do not log secrets; default redaction covers tokens and passwords.

## Pino-shaped calls

```js
log.info('message')
log.info({ key: 'value' }, 'with fields')
log.child({ component: 'db' }).debug('query')
```

## LLM / agent apps (Stage 2)

```js
import { logGenAiChat, logGenAiToolCall } from 'trevenant/ai'

logGenAiChat(log, { model: 'gpt-4', inputTokens: 100, outputTokens: 20 })
logGenAiToolCall(log, { toolName: 'search', callId: 'call-1', arguments: { q: 'x' } })
```

Prompt and completion fields are redacted when present.

## Token-efficient sinks

```js
const log = createLogger({ format: 'logfmt', dedup: true, capture: true })
```

Formats: `json` (default), `logfmt`, `compact`. `capture: true` fills the in-memory buffer for MCP.

## MCP log access

Run `node node_modules/trevenant/dist/mcp/bin.js` (after build) with `@modelcontextprotocol/sdk` installed. Tools: `query_logs`, `list_recent_logs`.

Example query: `SELECT * FROM logs WHERE correlationId = 'req-1' LIMIT 20`

## Avoid

- Adding pino/winston as dependencies for this package.
- Logging raw prompts without using gen_ai helpers (they redact by default).
- Stage 3-only work (codemods, playground, npm publish) unless explicitly requested.
