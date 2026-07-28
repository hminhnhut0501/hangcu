create table if not exists creem_config (
  id text primary key,
  api_key text not null default '',
  webhook_secret text not null default '',
  server text not null default 'test' check (server in ('test', 'prod')),
  product_mappings jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
