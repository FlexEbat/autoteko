import type { DomainErrorCode } from '@auteko/shared/errors'

export class AppError extends Error {
  readonly code: DomainErrorCode
  readonly details: Record<string, unknown> | undefined

  constructor(code: DomainErrorCode, details?: Record<string, unknown>) {
    super(code)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

// HTTP status for an error code (tech.md, section 7).
export function statusFor(code: string): number {
  switch (code) {
    case 'unauthenticated':
    case 'session_expired':
    case 'session_revoked':
    case 'credentials_invalid':
      return 401
    case 'forbidden':
    case 'ip_not_allowed':
      return 403
    case 'not_found':
    case 'invalid_id':
    case 'backup_not_found':
      return 404
    case 'version_conflict':
    case 'insufficient_stock':
    case 'invalid_transition':
    case 'account_locked':
      return 409
    case 'body_too_large':
      return 413
    case 'rate_limited':
      return 429
    case 'maintenance':
      return 503
    default:
      return 400
  }
}
