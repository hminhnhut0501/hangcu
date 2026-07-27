alter table if exists donate_packages
  add column if not exists vnd_amount_minor bigint,
  add column if not exists usd_amount_minor bigint;

update donate_packages
set
  vnd_amount_minor = coalesce(
    vnd_amount_minor,
    (metadata->'currencyPrices'->>'VND')::bigint,
    (metadata->'currency_prices'->>'VND')::bigint,
    case when upper(coalesce(currency, '')) = 'VND' then suggested_amount_minor end
  ),
  usd_amount_minor = coalesce(
    usd_amount_minor,
    (metadata->'currencyPrices'->>'USD')::bigint,
    (metadata->'currency_prices'->>'USD')::bigint,
    case when upper(coalesce(currency, '')) = 'USD' then suggested_amount_minor end
  );

with populated as (
  select
    id,
    vnd_amount_minor,
    usd_amount_minor,
    suggested_amount_minor,
    currency,
    metadata
  from donate_packages
)
update donate_packages target
set
  suggested_amount_minor = coalesce(populated.suggested_amount_minor, populated.vnd_amount_minor, populated.usd_amount_minor),
  currency = case
    when upper(coalesce(populated.currency, '')) = 'USD' then 'USD'
    when populated.vnd_amount_minor is not null then 'VND'
    when populated.usd_amount_minor is not null then 'USD'
    else populated.currency
  end,
  metadata = jsonb_set(
    coalesce(populated.metadata, '{}'::jsonb),
    '{currencyPrices}',
    jsonb_build_object('VND', populated.vnd_amount_minor, 'USD', populated.usd_amount_minor),
    true
  )
from populated
where target.id = populated.id;
