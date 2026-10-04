export type OtelTraceHook = () => Record<string, unknown>

let traceHook: OtelTraceHook | undefined

/** Register a hook that returns trace fields for each log line (e.g. from @opentelemetry/api). */
export function setOtelTraceHook (hook: OtelTraceHook | undefined): void {
  traceHook = hook
}

export function getOtelTraceFields (enabled: boolean): Record<string, unknown> {
  if (!enabled || traceHook === undefined) {
    return {}
  }
  try {
    return traceHook()
  } catch {
    return {}
  }
}

/** Build a hook from an already-imported OpenTelemetry API (no logs SDK dependency). */
export function createOpenTelemetryTraceHook (
  api: {
    trace: { getSpan: (ctx: unknown) => { spanContext: () => { traceId: string, spanId: string, traceFlags: number } } | undefined }
    context: { active: () => unknown }
  }
): OtelTraceHook {
  return () => {
    const span = api.trace.getSpan(api.context.active())
    if (span === undefined) {
      return {}
    }
    const { traceId, spanId, traceFlags } = span.spanContext()
    return {
      trace_id: traceId,
      span_id: spanId,
      trace_flags: `0${traceFlags.toString(16)}`
    }
  }
}
