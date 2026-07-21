create table if not exists site_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  category text not null check (category in ('hero', 'logo', 'banner', 'favicon', 'misc')),
  storage_path text not null,
  public_url text,
  alt_text_vi text,
  alt_text_en text,
  mime_type text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_site_assets_category_active on site_assets (category, is_active, sort_order, created_at desc);
