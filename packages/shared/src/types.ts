export type Uuid = string
export type Decimal = string // decimal string, for example "1234.50"
export type IsoDate = string // YYYY-MM-DD
export type IsoDateTime = string // 2026-10-11T10:15:00Z

export type Role = 'admin' | 'accountant' | 'buyer' | 'sales'
export type DealStatus = 'new' | 'confirmed' | 'shipped' | 'done' | 'cancelled'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type StockStatus = 'green' | 'yellow' | 'red'

export interface User {
  id: Uuid
  email: string
  full_name: string
  role: Role
  must_change_password: boolean
  totp_enabled: boolean
  is_active: boolean
  last_login_at: IsoDateTime | null
  created_at: IsoDateTime
}

export interface Product {
  id: Uuid
  auteko_article: string
  original_articles: string[]
  name: string
  engine_models: string[]
  tnved_code: string | null
  production_days_min: number | null
  production_days_max: number | null
  is_available: boolean
  notes: string | null
  status: 'active' | 'archived'
  created_at: IsoDateTime
  updated_at: IsoDateTime
}

export interface Client {
  id: Uuid
  company_name: string
  inn: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  notes: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
}

// The full batch is visible to admin, accountant and buyer.
export interface Batch {
  id: Uuid
  batch_number: string
  product_id: Uuid
  quantity: number
  price_exw_cny: Decimal
  cny_rate: Decimal
  cny_rate_date: IsoDate
  customs_duty_pct: Decimal
  vat_pct: Decimal
  transport_cost_rub: Decimal
  other_costs_rub: Decimal
  cost_mode: 'calculated' | 'manual'
  cost_price_rub: Decimal
  markup_coefficient: Decimal
  price_mode: 'markup' | 'manual'
  price_kp_rub: Decimal
  profit_per_unit_rub: Decimal
  gtd_number: string | null
  gtd_date: IsoDate | null
  notes: string | null
  version: number
  created_at: IsoDateTime
  updated_at: IsoDateTime
}

// Reduced batch for the sales role and for the PWA sync channel (all roles get it).
export type BatchPublic = Pick<
  Batch,
  'id' | 'batch_number' | 'product_id' | 'price_kp_rub' | 'version' | 'updated_at'
> & { received: number; sold: number; balance: number }

export interface Deal {
  id: Uuid
  deal_number: string
  client_id: Uuid
  product_id: Uuid
  batch_id: Uuid
  owner_user_id: Uuid
  quote_id: Uuid | null
  contract_number: string | null
  spec_number: string | null
  quantity: number
  price_with_vat: Decimal
  total_amount: Decimal
  delivery_deadline: IsoDate | null
  prepayment_date: IsoDate | null
  actual_delivery_date: IsoDate | null
  actual_payment_date: IsoDate | null
  upd_number: string | null
  upd_date: IsoDate | null
  status: DealStatus
  notes: string | null
  version: number
  created_at: IsoDateTime
  updated_at: IsoDateTime
}

export interface QuoteItem {
  id: Uuid
  position: number
  product_id: Uuid
  batch_id: Uuid | null
  quantity: number
  unit_price_with_vat: Decimal
}

export interface Quote {
  id: Uuid
  quote_number: string
  client_id: Uuid
  owner_user_id: Uuid
  status: QuoteStatus
  valid_until: IsoDate
  notes: string | null
  items: QuoteItem[]
  version: number
  created_at: IsoDateTime
  updated_at: IsoDateTime
}

export interface StockRow {
  product_id: Uuid
  auteko_article: string
  name: string
  engine_models: string[]
  batch_id: Uuid
  batch_number: string
  received: number
  sold: number
  balance: number
  price_kp_rub: Decimal
  stock_status: StockStatus
}
