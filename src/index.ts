import consola, { Consola, FancyReporter, LogLevel } from 'consola'
import ErrorService from 'pretty-error'
import dayjs from 'dayjs'

export class Trevenant {
  private readonly _logger: Consola
  private readonly _errorService: ErrorService
  success: TrevenantLogger
  info: TrevenantLogger
  error: TrevenantLogger
  debug: TrevenantLogger
  fatal: TrevenantLogger
  warn: TrevenantLogger

  constructor (level: LogLevel = LogLevel.Info) {
    this._errorService = new ErrorService().withColors()
    this._errorService.skipNodeFiles()
    this._errorService.start()

    this._logger = consola.create({
      level,
      reporters: [
        new TrevenantReporter()
      ]
    })

    this.debug = (message: any, ...args: any[]) => {
      this._logger.debug(message, ...args)
      return this
    }
    this.error = (message: any, ...args: any[]) => {
      this._logger.error(message, ...args)
      return this
    }
    this.fatal = (message: any, ...args: any[]) => {
      this._logger.fatal(message, ...args)
      return this
    }
    this.info = (message: any, ...args: any[]) => {
      this._logger.info(message, ...args)
      return this
    }
    this.success = (message: any, ...args: any[]) => {
      this._logger.success(message, ...args)
      return this
    }
    this.warn = (message: any, ...args: any[]) => {
      this._logger.warn(message, ...args)
      return this
    }
  }
}

class TrevenantReporter extends FancyReporter {
  protected override formatDate (date: Date): string {
    return dayjs(date).format('D\' MMM ha:m:s')
  }
}

type TrevenantLogger = (message: any, ...args: any[]) => Trevenant

export default Trevenant
