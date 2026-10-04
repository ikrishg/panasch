export type OtelMixin = () => Record<string, string | undefined>;
/** Load OpenTelemetry trace context for pino `mixin` (only when otel is enabled). */
export declare function loadOtelMixin(): OtelMixin;
