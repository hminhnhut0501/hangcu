create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null,
  value numeric not null,
  currency text,
  min_order_minor bigint not null default 0,
  max_redemptions integer not null default 1,
  redemption_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  actor_type text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  signature_valid boolean not null default false,
  processing_status text not null default 'pending' check (processing_status in ('pending', 'processed', 'failed')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (provider, provider_event_id)
);

