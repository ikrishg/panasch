---
name: panasch-logging
description: Use the Panasch zero-dependency logger with async context, redaction, gen_ai helpers, and MCP log capture.
---

# Panasch logging

Use Panasch when adding structured logs in the ikrishg/panasch repo.

## Defaults

- Prefer `createLogger` from `panasch` with JSON output.
- Wrap request/work units in `runWithContext({ requestId })` so `correlationId` is automatic.
- On Node servers, call `installNodeContext()` from `panasch/context/node` once at startup.
- Do not log secrets; default redaction covers tokens and passwords.

## Pino-shaped calls

```typescript
log.info('message')
log.info({ key: 'value' }, 'with fields')
log.child({ component: 'db' }).debug('query')
```

## LLM / agent apps

```typescript
import { logGenAiChat, logGenAiToolCall } from 'panasch/ai'
```

## Token-efficient sinks

```typescript
const log = createLogger({ format: 'logfmt', dedup: true, capture: true })
```

## MCP log access

Run `yarn mcp` after `yarn build` with `@modelcontextprotocol/sdk` installed.

## Avoid

- Adding pino/winston as dependencies for this package.
- Logging raw prompts without gen_ai helpers.
