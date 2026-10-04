import type { Logger } from '../logger.js'
import { redactGenAiFields } from './prompt-redact.js'

export type GenAiChatEvent = {
  model: string
  system?: string
  operationName?: string
  inputTokens?: number
  outputTokens?: number
  cost?: number
  prompt?: string
  completion?: string
}

export type GenAiToolCallEvent = {
  model?: string
  toolName: string
  callId: string
  arguments?: unknown
  result?: unknown
  inputTokens?: number
  outputTokens?: number
}

export type GenAiEmbeddingEvent = {
  model: string
  inputTokens?: number
  dimensions?: number
}

export function buildGenAiChatFields (event: GenAiChatEvent): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    'gen_ai.system': event.system ?? 'unknown',
    'gen_ai.operation.name': event.operationName ?? 'chat',
    'gen_ai.request.model': event.model,
    'gen_ai.response.model': event.model
  }
  if (event.inputTokens !== undefined) {
    fields['gen_ai.usage.input_tokens'] = event.inputTokens
  }
  if (event.outputTokens !== undefined) {
    fields['gen_ai.usage.output_tokens'] = event.outputTokens
  }
  if (event.cost !== undefined) {
    fields['gen_ai.usage.cost'] = event.cost
  }
  if (event.prompt !== undefined) {
    fields['gen_ai.prompt'] = event.prompt
  }
  if (event.completion !== undefined) {
    fields['gen_ai.completion'] = event.completion
  }
  return redactGenAiFields(fields)
}

export function buildGenAiToolCallFields (event: GenAiToolCallEvent): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    'gen_ai.operation.name': 'tool_call',
    'gen_ai.tool.name': event.toolName,
    'gen_ai.tool.call.id': event.callId
  }
  if (event.model !== undefined) {
    fields['gen_ai.request.model'] = event.model
  }
  if (event.arguments !== undefined) {
    fields['gen_ai.tool.call.arguments'] = event.arguments
  }
  if (event.result !== undefined) {
    fields['gen_ai.tool.call.result'] = event.result
  }
  if (event.inputTokens !== undefined) {
    fields['gen_ai.usage.input_tokens'] = event.inputTokens
  }
  if (event.outputTokens !== undefined) {
    fields['gen_ai.usage.output_tokens'] = event.outputTokens
  }
  return redactGenAiFields(fields)
}

export function buildGenAiEmbeddingFields (event: GenAiEmbeddingEvent): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    'gen_ai.operation.name': 'embeddings',
    'gen_ai.request.model': event.model
  }
  if (event.inputTokens !== undefined) {
    fields['gen_ai.usage.input_tokens'] = event.inputTokens
  }
  if (event.dimensions !== undefined) {
    fields['gen_ai.embeddings.dimension_count'] = event.dimensions
  }
  return fields
}

export function logGenAiChat (logger: Logger, event: GenAiChatEvent, msg = 'gen_ai chat'): void {
  logger.info(buildGenAiChatFields(event), msg)
}

export function logGenAiToolCall (logger: Logger, event: GenAiToolCallEvent, msg = 'gen_ai tool call'): void {
  logger.info(buildGenAiToolCallFields(event), msg)
}

export function logGenAiEmbedding (logger: Logger, event: GenAiEmbeddingEvent, msg = 'gen_ai embedding'): void {
  logger.info(buildGenAiEmbeddingFields(event), msg)
}
