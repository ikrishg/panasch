import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createLogger } from '../dist/index.js'
import { logGenAiChat, buildGenAiChatFields } from '../dist/ai/index.js'

describe('gen_ai helpers', () => {
  it('emits gen_ai.* fields', () => {
    const lines = []
    const log = createLogger({ sink: (line) => { lines.push(line) } })
    logGenAiChat(log, {
      model: 'gpt-4',
      inputTokens: 10,
      outputTokens: 5,
      system: 'openai'
    })
    const record = JSON.parse(lines[0])
    assert.equal(record['gen_ai.request.model'], 'gpt-4')
    assert.equal(record['gen_ai.usage.input_tokens'], 10)
  })

  it('redacts prompts by default', () => {
    const fields = buildGenAiChatFields({
      model: 'gpt-4',
      prompt: 'secret-token-12345'
    })
    assert.equal(fields['gen_ai.prompt'], '[Redacted]')
  })
})
