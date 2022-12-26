import { LogLevel } from 'consola';
export declare class Trevenant {
    private readonly _logger;
    private readonly _errorService;
    success: TrevenantLogger;
    info: TrevenantLogger;
    error: TrevenantLogger;
    debug: TrevenantLogger;
    fatal: TrevenantLogger;
    warn: TrevenantLogger;
    constructor(level?: LogLevel);
}
declare type TrevenantLogger = (message: any, ...args: any[]) => Trevenant;
export default Trevenant;
