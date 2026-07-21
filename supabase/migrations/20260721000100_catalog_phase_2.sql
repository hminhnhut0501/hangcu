create extension if not exists pgcrypto;

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image_path text,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'hidden', 'archived')),
  collection_id uuid references collections(id) on delete set null,
  featured boolean not null default false,
  download_limit integer not null default 3,
  download_expiry_days integer not null default 30,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('preview', 'detail', 'lifestyle')),
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  width integer,
  height integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  currency text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  compare_at_amount_minor bigint check (compare_at_amount_minor is null or compare_at_amount_minor >= 0),
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_collections_status_sort on collections (status, sort_order, created_at desc);
create index if not exists idx_products_status_featured on products (status, featured, published_at desc);
create index if not exists idx_products_collection on products (collection_id);
create index if not exists idx_product_media_product_sort on product_media (product_id, sort_order);
create index if not exists idx_prices_product_active on prices (product_id, is_active, valid_from desc);

