-- Production guard: older environments may have the orders table without the
-- reconciliation columns even when the original migration is marked applied.
alter table if exists orders
  add column if not exists payment_provider text,
  add column if not exists provider_checkout_id text,
  add column if not exists provider_order_id text,
  add column if not exists provider_payment_id text,
  add column if not exists provider_event_id text,
  add column if not exists payment_receipt_url text,
  add column if not exists fulfillment_method text not null default 'auto_email',
  add column if not exists delivery_license_key_ids jsonb not null default '[]'::jsonb,
  add column if not exists delivery_proof jsonb not null default '{}'::jsonb,
  add column if not exists delivered_at timestamptz,
  add column if not exists payment_recorded_at timestamptz,
  add column if not exists first_paid_at timestamptz,
  add column if not exists last_payment_event_at timestamptz;
