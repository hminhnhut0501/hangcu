create table if not exists paypal_config (
  id text primary key,
  client_id text not null default '',
  client_secret text not null default '',
  webhook_id text not null default '',
  environment text not null default 'sandbox' check (environment in ('sandbox', 'live')),
  updated_at timestamptz not null default now()
);
