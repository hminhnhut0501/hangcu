create table if not exists payment_callback_outbox (
  idempotency_key text primary key,
  bot_order_id text not null,
  web_order_id uuid not null,
  order_number text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  delivered_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists payment_callback_outbox_retry_idx on payment_callback_outbox (status, next_attempt_at);
