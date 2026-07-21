-- Archived fulfillment migration.
-- Reference only; canonical schema lives in 20260721000400_license_phase_1.sql
-- and the rename path is documented in 20260721000500_rename_legacy_gift_codes_to_license_keys.sql.

create table if not exists gift_code_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  external_plan_key text not null,
  duration_days integer not null default 0,
  is_lifetime boolean not null default false,
  redemption_expiry_days integer not null default 30,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists product_reward_rules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  gift_code_type_id uuid not null references gift_code_types(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists gift_codes (
  id uuid primary key default gen_random_uuid(),
  gift_code_type_id uuid not null references gift_code_types(id) on delete restrict,
  code_hash text not null unique,
  encrypted_code text,
  code_last_four text not null,
  status text not null default 'available' check (status in ('available', 'reserved', 'issued', 'redeemed', 'expired', 'revoked')),
  order_id uuid,
  order_item_id uuid,
  customer_id uuid,
  issued_at timestamptz,
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_external_user_id text,
  revoked_at timestamptz,
  revoked_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  customer_id uuid,
  product_file_id uuid,
  token_hash text not null unique,
  download_count integer not null default 0,
  download_limit integer not null default 0,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table gift_codes
  add constraint gift_codes_order_fk foreign key (order_id) references orders(id) on delete set null;

alter table gift_codes
  add constraint gift_codes_order_item_fk foreign key (order_item_id) references order_items(id) on delete set null;

create index if not exists idx_gift_codes_status_type on gift_codes (status, gift_code_type_id, created_at desc);
create index if not exists idx_reward_rules_product_active on product_reward_rules (product_id, is_active, starts_at desc);
create index if not exists idx_downloads_token_hash on downloads (token_hash);
