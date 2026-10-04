import { type Level, type LoggerOptions } from 'pino';
export type PanaschOptions = {
    /** Minimum log level (default: `info`). */
    level?: Level;
    /** Human-readable output instead of JSON lines (default: `false`). */
    pretty?: boolean;
    /** Include active OpenTelemetry trace/span IDs in each log line (default: `false`). */
    otel?: boolean;
    /** Extra options forwarded to the underlying pino instance. */
    pino?: LoggerOptions;
};
export type PanaschLogger = (message: unknown, ...args: unknown[]) => Panasch;
export declare class Panasch {
    private readonly _logger;
    readonly debug: PanaschLogger;
    readonly info: PanaschLogger;
    readonly warn: PanaschLogger;
    readonly error: PanaschLogger;
    readonly fatal: PanaschLogger;
    readonly success: PanaschLogger;
    constructor(options?: PanaschOptions);
    private write;
    private writeSuccess;
    private writeOn;
    private writeSuccessOn;
}
/** @deprecated Use {@link Panasch} — retained for callers still importing the old name. */
export declare const Trevenant: typeof Panasch;
export default Panasch;
