// eslint-disable-next-line @typescript-eslint/naming-convention
import PrettyError from 'pretty-error'
import * as process from 'process'
import winston from 'winston'

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export type Logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [method in LogLevel]: (message: string, info?: any) => void
}

const prettyError = new PrettyError()
  .skipNodeFiles()
  .skip(
    (traceLine: Record<string, unknown>): boolean =>
      traceLine.packageName !== '[current]'
  )
  .appendStyle({
    'pretty-error': {
      marginLeft: 0,
    },
    'pretty-error > trace': {
      marginTop: 0,
    },
    'pretty-error > trace > item': {
      bullet: '',
      marginBottom: 0,
    },
  })

const prettyErrorFormat = winston.format((info) => {
  if (info.stack) {
    return {
      ...info,
      message: prettyError.render(info),
      stack: undefined,
    }
  }

  return info
})

const format = winston.format.combine(
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  prettyErrorFormat(),
  winston.format.simple()
)

let logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format,
  transports: [new winston.transports.Console()],
})

export const setLogger = (l: Logger): void => {
  logger = l
}

export const log = (): Logger => {
  return logger
}
