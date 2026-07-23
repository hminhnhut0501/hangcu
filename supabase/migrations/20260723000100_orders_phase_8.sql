create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_email text not null,
  currency text not null,
  subtotal_minor bigint not null default 0,
  discount_minor bigint not null default 0,
  total_minor bigint not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  fulfillment_status text not null default 'unfulfilled',
  source text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_orders_order_number on orders (order_number);
create index if not exists idx_orders_customer_email on orders (customer_email);
create index if not exists idx_orders_status_created_at on orders (status, created_at desc);
create index if not exists idx_orders_payment_status_created_at on orders (payment_status, created_at desc);
create index if not exists idx_orders_metadata on orders using gin (metadata);
