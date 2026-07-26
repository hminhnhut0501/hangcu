alter table if exists donate_packages
  alter column id type text using id::text,
  alter column code type text,
  alter column name type text,
  alter column slug type text,
  alter column description type text,
  alter column currency type text,
  alter column status type text;

insert into donate_packages (id, code, name, slug, description, suggested_amount_minor, currency, status, metadata)
values
  (
    'dp_support_30',
    'SUPPORT_30',
    'Gói ủng hộ cơ bản',
    'support-package-basic',
    'Gói ủng hộ một lần với mức gợi ý nhỏ.',
    9900,
    'VND',
    'active',
    '{}'::jsonb
  ),
  (
    'dp_support_plus',
    'SUPPORT_PLUS',
    'Gói ủng hộ nâng cao',
    'support-package-plus',
    'Gói ủng hộ cân bằng cho khách muốn đóng góp nhiều hơn.',
    19900,
    'VND',
    'active',
    '{}'::jsonb
  ),
  (
    'dp_support_life',
    'SUPPORT_LIFE',
    'Gói ủng hộ trọn đời',
    'support-package-lifetime',
    'Gói ủng hộ dài hạn dành cho người muốn đồng hành lâu hơn.',
    49900,
    'VND',
    'active',
    '{}'::jsonb
  )
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  suggested_amount_minor = excluded.suggested_amount_minor,
  currency = excluded.currency,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = timezone('utc', now());

