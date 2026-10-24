export type DeployMode = 'internal' | 'public'

export interface Config {
  deployMode: DeployMode
  timezone: string
  databaseUrl: string | undefined
  logLevel: string
}

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']

function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

// Reads and validates the environment once at start; an invalid value stops the process.
export function loadConfig(env: Readonly<Record<string, string | undefined>> = process.env): Config {
  const mode = env['DEPLOY_MODE'] ?? 'internal'
  if (mode !== 'internal' && mode !== 'public') {
    throw new Error(`DEPLOY_MODE must be "internal" or "public", got "${mode}"`)
  }
  const timezone = env['APP_TIMEZONE'] ?? 'Europe/Moscow'
  if (!isValidTimeZone(timezone)) throw new Error(`APP_TIMEZONE is not a valid time zone: "${timezone}"`)
  const logLevel = env['LOG_LEVEL'] ?? 'info'
  if (!LOG_LEVELS.includes(logLevel)) throw new Error(`LOG_LEVEL is not a valid level: "${logLevel}"`)
  return { deployMode: mode, timezone, databaseUrl: env['DATABASE_URL'], logLevel }
}
