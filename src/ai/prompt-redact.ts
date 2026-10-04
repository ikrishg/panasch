import { redactRecord } from '../redact.js'

export const GEN_AI_REDACT_PATHS = [
  'gen_ai.prompt',
  'gen_ai.completion',
  'gen_ai.request.prompt',
  'gen_ai.response.completion',
  'prompt',
  'completion',
  'messages',
  'content'
]

export function redactGenAiFields (fields: Record<string, unknown>): Record<string, unknown> {
  return redactRecord(fields, GEN_AI_REDACT_PATHS)
}
