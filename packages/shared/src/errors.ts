export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function error<E>(code: E): Result<never, E> {
  return { ok: false, error: code }
}

export type FieldProblem = 'required' | 'invalid' | 'too_long' | 'out_of_range' | 'duplicate'

export type ErrorField =
  | 'auteko_article'
  | 'original_articles'
  | 'name'
  | 'engine_models'
  | 'tnved_code'
  | 'production_days_min'
  | 'production_days_max'
  | 'notes'
  | 'company_name'
  | 'inn'
  | 'contact_person'
  | 'phone'
  | 'email'
  | 'batch_number'
  | 'quantity'
  | 'price_exw_cny'
  | 'cny_rate'
  | 'customs_duty_pct'
  | 'vat_pct'
  | 'transport_cost_rub'
  | 'other_costs_rub'
  | 'markup_coefficient'
  | 'cost_price_rub'
  | 'price_kp_rub'
  | 'gtd_number'
  | 'price_with_vat'
  | 'contract_number'
  | 'spec_number'
  | 'upd_number'
  | 'delivery_deadline'
  | 'prepayment_date'
  | 'actual_delivery_date'
  | 'actual_payment_date'
  | 'upd_date'
  | 'items'
  | 'valid_until'
  | 'full_name'
  | 'role'
  | 'password'

export type FieldErrorCode = `${ErrorField}_${FieldProblem}`

export const DOMAIN_ERROR_CODES = [
  'unauthenticated',
  'session_expired',
  'session_revoked',
  'forbidden',
  'not_found',
  'invalid_id',
  'invalid_body',
  'body_too_large',
  'rate_limited',
  'maintenance',
  'version_conflict',
  'insufficient_stock',
  'invalid_transition',
  'delivery_date_required',
  'payment_date_required',
  'product_archived',
  'product_has_batches',
  'batch_has_deals',
  'client_has_deals',
  'batch_product_mismatch',
  'credentials_invalid',
  'account_locked',
  'totp_required',
  'totp_invalid',
  'totp_enrollment_required',
  'password_weak',
  'password_mismatch',
  'reauth_required',
  'last_admin',
  'ip_not_allowed',
  'import_too_large',
  'import_bad_format',
  'import_too_many_rows',
  'rate_unavailable',
  'backup_failed',
  'backup_not_found',
  'restore_confirm_mismatch',
] as const

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[number]
export type ErrorCode = FieldErrorCode | DomainErrorCode
