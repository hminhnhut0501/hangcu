create table if not exists license_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  slug text not null unique,
  description text,
  plan_type text not null default 'regular' check (plan_type in ('regular', 'donate_bonus', 'special')),
  duration_days integer not null default 0,
  is_lifetime boolean not null default false,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists donate_packages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  slug text not null unique,
  description text,
  suggested_amount_minor bigint,
  currency text,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists product_license_rules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  license_plan_id uuid not null references license_plans(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists license_keys (
  id uuid primary key default gen_random_uuid(),
  license_plan_id uuid not null references license_plans(id) on delete restrict,
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

create index if not exists idx_license_plans_status_sort on license_plans (status, sort_order, created_at desc);
create index if not exists idx_donate_packages_status_sort on donate_packages (status, created_at desc);
create index if not exists idx_product_license_rules_product_active on product_license_rules (product_id, is_active, starts_at desc);
create index if not exists idx_license_keys_status_plan on license_keys (status, license_plan_id, created_at desc);

