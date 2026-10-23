-- AUTEKO schema, version 1. Created by the migrator role.
create extension if not exists pg_trgm;

do $$
begin
  -- Roles carry no password here: the operator sets it (see docs/OPERATIONS.md).
  if not exists (select from pg_roles where rolname = 'auteko_app') then
    create role auteko_app login;
  end if;
  if not exists (select from pg_roles where rolname = 'auteko_migrator') then
    create role auteko_migrator login;
  end if;
end
$$;

create table if not exists schema_migrations (
  version integer primary key,
  name text not null,
  applied_at timestamptz not null default now(),
  checksum text not null
);

create table users (
  id uuid primary key default uuidv7(),
  email text not null check (char_length(email) <= 254),
  full_name text not null check (char_length(full_name) <= 200),
  role text not null check (role in ('admin', 'accountant', 'buyer', 'sales')),
  password_hash text not null,
  must_change_password boolean not null default true,
  totp_secret_enc text,
  totp_enabled boolean not null default false,
  recovery_codes_hash text[] not null default '{}',
  is_active boolean not null default true,
  failed_login_count integer not null default 0,
  locked_until timestamptz,
  password_changed_at timestamptz not null,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index users_email_key on users (lower(email));

create table sessions (
  id text primary key,
  user_id uuid not null references users (id) on delete cascade,
  kind text not null check (kind in ('web', 'pwa')),
  device_name text check (char_length(device_name) <= 100),
  ip inet,
  user_agent text check (char_length(user_agent) <= 300),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index sessions_user_id_idx on sessions (user_id);
create index sessions_expires_at_idx on sessions (expires_at);

create table settings (
  key text primary key check (key in ('low_stock_threshold', 'default_vat_pct', 'default_markup', 'quote_validity_days')),
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references users (id)
);
insert into settings (key, value) values
  ('low_stock_threshold', '10'),
  ('default_vat_pct', '22'),
  ('default_markup', '1.25'),
  ('quote_validity_days', '14');

-- Sequence and trigger function that give every synchronised row a larger sync_seq.
-- The advisory lock is held until commit, so commit order equals sync_seq order and a
-- client reading by cursor never skips a row.
create sequence sync_seq_seq;
create function set_sync_seq() returns trigger language plpgsql as $$
begin
  perform pg_advisory_xact_lock(7243001);
  new.sync_seq := nextval('sync_seq_seq');
  return new;
end
$$;

create table products (
  id uuid primary key default uuidv7(),
  auteko_article text not null,
  original_articles text[] not null default '{}',
  name text not null,
  engine_models text[] not null default '{}',
  tnved_code text check (tnved_code ~ '^[0-9]{10}$'),
  production_days_min integer check (production_days_min > 0),
  production_days_max integer,
  is_available boolean not null default true,
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  search_key text not null,
  created_by uuid references users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sync_seq bigint not null,
  check (production_days_max is null or production_days_min is null or production_days_max >= production_days_min)
);
create unique index products_article_key on products (lower(auteko_article));
create index products_search_key_trgm_idx on products using gin (search_key gin_trgm_ops);
create index products_engine_models_idx on products using gin (engine_models);
create index products_status_idx on products (status);
create index products_sync_seq_idx on products (sync_seq);
create trigger products_sync_seq before insert or update on products for each row execute function set_sync_seq();

create table clients (
  id uuid primary key default uuidv7(),
  company_name text not null,
  inn text check (inn ~ '^([0-9]{10}|[0-9]{12})$'),
  contact_person text,
  phone text,
  email text,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sync_seq bigint not null
);
create index clients_company_name_idx on clients (lower(company_name));
create index clients_sync_seq_idx on clients (sync_seq);
create trigger clients_sync_seq before insert or update on clients for each row execute function set_sync_seq();

create table exchange_rates (
  id uuid primary key default uuidv7(),
  currency text not null check (currency in ('CNY')),
  rate numeric(12, 4) not null check (rate > 0),
  rate_date date not null,
  source text not null check (source in ('manual', 'cbr')),
  created_by uuid references users (id),
  created_at timestamptz not null default now(),
  unique (currency, rate_date)
);

create table batches (
  id uuid primary key default uuidv7(),
  batch_number text not null unique check (batch_number ~ '^P-[0-9]{4}-[0-9]{2,}$'),
  product_id uuid not null references products (id),
  quantity integer not null check (quantity > 0),
  price_exw_cny numeric(14, 4) not null check (price_exw_cny > 0),
  cny_rate numeric(12, 4) not null check (cny_rate > 0),
  cny_rate_date date not null,
  customs_duty_pct numeric(5, 2) not null default 0 check (customs_duty_pct between 0 and 100),
  vat_pct numeric(5, 2) not null check (vat_pct between 0 and 100),
  transport_cost_rub numeric(14, 2) not null check (transport_cost_rub >= 0),
  other_costs_rub numeric(14, 2) not null check (other_costs_rub >= 0),
  cost_mode text not null check (cost_mode in ('calculated', 'manual')),
  cost_price_rub numeric(14, 2) not null check (cost_price_rub >= 0),
  markup_coefficient numeric(6, 3) not null check (markup_coefficient > 0),
  price_mode text not null check (price_mode in ('markup', 'manual')),
  price_kp_rub numeric(14, 2) not null check (price_kp_rub > 0),
  profit_per_unit_rub numeric(14, 2) not null,
  gtd_number text check (gtd_number ~ '^[0-9]{8}/[0-9]{6}/[0-9]{7}$'),
  gtd_date date,
  notes text,
  version integer not null default 1,
  created_by uuid references users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sync_seq bigint not null,
  -- lets a deal reference a batch together with its product, so they cannot disagree
  unique (id, product_id)
);
create index batches_product_id_idx on batches (product_id);
create index batches_sync_seq_idx on batches (sync_seq);
create trigger batches_sync_seq before insert or update on batches for each row execute function set_sync_seq();

create table quotes (
  id uuid primary key default uuidv7(),
  quote_number text not null unique check (quote_number ~ '^KP-[0-9]{4}-[0-9]{4,}$'),
  client_id uuid not null references clients (id),
  owner_user_id uuid not null references users (id),
  status text not null check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until date not null,
  notes text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sync_seq bigint not null
);
create index quotes_client_id_idx on quotes (client_id);
create index quotes_owner_user_id_idx on quotes (owner_user_id);
create index quotes_sync_seq_idx on quotes (sync_seq);
create trigger quotes_sync_seq before insert or update on quotes for each row execute function set_sync_seq();

create table quote_items (
  id uuid primary key default uuidv7(),
  quote_id uuid not null references quotes (id) on delete cascade,
  position integer not null,
  product_id uuid not null references products (id),
  batch_id uuid references batches (id),
  quantity integer not null check (quantity > 0),
  unit_price_with_vat numeric(14, 2) not null check (unit_price_with_vat > 0),
  unique (quote_id, position)
);

create table deals (
  id uuid primary key default uuidv7(),
  deal_number text not null unique check (deal_number ~ '^R-[0-9]{3,}$'),
  client_id uuid not null references clients (id),
  product_id uuid not null references products (id),
  batch_id uuid not null,
  owner_user_id uuid not null references users (id),
  quote_id uuid references quotes (id),
  contract_number text,
  spec_number text,
  quantity integer not null check (quantity > 0),
  price_with_vat numeric(14, 2) not null check (price_with_vat > 0),
  total_amount numeric(16, 2) generated always as (quantity * price_with_vat) stored,
  delivery_deadline date,
  prepayment_date date,
  actual_delivery_date date,
  actual_payment_date date,
  upd_number text,
  upd_date date,
  status text not null check (status in ('new', 'confirmed', 'shipped', 'done', 'cancelled')),
  notes text,
  client_request_id uuid unique,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sync_seq bigint not null,
  foreign key (batch_id, product_id) references batches (id, product_id)
);
create index deals_batch_id_idx on deals (batch_id);
create index deals_client_id_idx on deals (client_id);
create index deals_owner_user_id_idx on deals (owner_user_id);
create index deals_status_idx on deals (status);
create index deals_delivery_deadline_idx on deals (delivery_deadline);
create index deals_sync_seq_idx on deals (sync_seq);
create trigger deals_sync_seq before insert or update on deals for each row execute function set_sync_seq();

create table audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid,
  user_email text not null,
  action text not null,
  entity text,
  entity_id text,
  details jsonb not null default '{}',
  ip inet
);
create index audit_log_at_idx on audit_log (at desc);
create index audit_log_user_id_idx on audit_log (user_id);

create table doc_counters (
  kind text not null check (kind in ('deal', 'quote', 'batch')),
  year integer not null,
  last integer not null default 0,
  primary key (kind, year)
);

create table sync_mutations (
  id uuid primary key,
  user_id uuid not null references users (id),
  type text not null,
  applied_at timestamptz not null default now(),
  result jsonb not null
);
create index sync_mutations_user_id_idx on sync_mutations (user_id);

-- Privileges. The application role runs data statements only; the audit log is append-only for it.
grant usage on schema public to auteko_app;
grant all on schema public to auteko_migrator;
grant select, insert, update, delete on all tables in schema public to auteko_app;
grant usage, select on all sequences in schema public to auteko_app;
revoke update, delete, truncate on audit_log from auteko_app;
revoke insert, update, delete, truncate on schema_migrations from auteko_app;
grant all on all tables in schema public to auteko_migrator;
grant all on all sequences in schema public to auteko_migrator;
alter default privileges in schema public grant select, insert, update, delete on tables to auteko_app;
alter default privileges in schema public grant usage, select on sequences to auteko_app;
