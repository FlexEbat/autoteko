import { pino, type DestinationStream, type Logger } from 'pino'

// Structured JSON to stdout. Secrets never reach the log: these paths are removed.
const REDACTED_PATHS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  '*.password',
  '*.token',
  '*.secret',
  'req.headers.authorization',
  'req.headers.cookie',
]

export function createLogger(level: string, destination?: DestinationStream): Logger {
  return pino({ level, redact: { paths: REDACTED_PATHS, censor: '[redacted]' } }, destination)
}
