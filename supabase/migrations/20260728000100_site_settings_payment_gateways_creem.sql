alter table if exists site_settings
  add column if not exists payment_gateways jsonb not null default '[]'::jsonb;

update site_settings
set payment_gateways =
  case
    when payment_gateways is null or payment_gateways = '[]'::jsonb then
      '[{"provider":"payos","labelVi":"PayOS","labelEn":"PayOS","currencies":["VND"],"visible":true},{"provider":"paypal","labelVi":"PayPal","labelEn":"PayPal","currencies":["USD"],"visible":true},{"provider":"lemonsqueezy","labelVi":"Lemon Squeezy","labelEn":"Lemon Squeezy","currencies":["USD"],"visible":true},{"provider":"creem","labelVi":"Creem","labelEn":"Creem","currencies":["USD"],"visible":true},{"provider":"sandbox","labelVi":"Sandbox","labelEn":"Sandbox","currencies":["VND","USD"],"visible":true},{"provider":"manual","labelVi":"Thủ công","labelEn":"Manual","currencies":["VND","USD"],"visible":true}]'::jsonb
    when not exists (
      select 1
      from jsonb_array_elements(payment_gateways) as gateway
      where gateway->>'provider' = 'creem'
    ) then
      payment_gateways || '[{"provider":"creem","labelVi":"Creem","labelEn":"Creem","currencies":["USD"],"visible":true}]'::jsonb
    else payment_gateways
  end
where id = 'global';
