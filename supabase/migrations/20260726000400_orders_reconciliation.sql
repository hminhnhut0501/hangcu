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

update orders
set
  payment_provider = coalesce(payment_provider, metadata->>'paymentProvider', metadata->>'checkoutProvider', metadata->>'provider'),
  provider_checkout_id = coalesce(provider_checkout_id, metadata->>'providerCheckoutId', metadata->>'paymentSessionId', metadata->>'checkoutId'),
  provider_order_id = coalesce(provider_order_id, metadata->>'providerOrderId', metadata->>'payosOrderCode', metadata->>'orderId'),
  provider_payment_id = coalesce(provider_payment_id, metadata->>'providerPaymentId'),
  provider_event_id = coalesce(provider_event_id, metadata->>'providerEventId'),
  payment_receipt_url = coalesce(payment_receipt_url, metadata->>'paymentReceiptUrl'),
  fulfillment_method = coalesce(fulfillment_method, metadata->>'fulfillmentMethod', 'auto_email'),
  delivery_license_key_ids = case
    when delivery_license_key_ids <> '[]'::jsonb then delivery_license_key_ids
    when metadata ? 'issuedLicenseKeyId' then jsonb_build_array(metadata->>'issuedLicenseKeyId')
    when metadata ? 'deliveryLicenseKeyIds' then coalesce(metadata->'deliveryLicenseKeyIds', '[]'::jsonb)
    else delivery_license_key_ids
  end,
  delivery_proof = case
    when delivery_proof <> '{}'::jsonb then delivery_proof
    else coalesce(metadata->'deliveryProof', metadata->'delivery_proof', '{}'::jsonb)
  end,
  delivered_at = coalesce(delivered_at, nullif(metadata->>'issuedAt', '')::timestamptz, nullif(metadata->>'deliveredAt', '')::timestamptz),
  payment_recorded_at = coalesce(payment_recorded_at, nullif(metadata->>'paidAt', '')::timestamptz),
  first_paid_at = coalesce(first_paid_at, nullif(metadata->>'paidAt', '')::timestamptz),
  last_payment_event_at = coalesce(last_payment_event_at, nullif(metadata->>'lastPaymentEventAt', '')::timestamptz, nullif(metadata->>'paidAt', '')::timestamptz);
