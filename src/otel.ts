export type OtelMixin = () => Record<string, string | undefined>

/** Load OpenTelemetry trace context for pino `mixin` (only when otel is enabled). */
export function loadOtelMixin (): OtelMixin {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { trace, context } = require('@opentelemetry/api') as typeof import('@opentelemetry/api')

    return () => {
      const span = trace.getSpan(context.active())
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
  } catch {
    throw new Error(
      'Panasch otel option requires @opentelemetry/api. Install it in your project when enabling otel.'
    )
  }
}
