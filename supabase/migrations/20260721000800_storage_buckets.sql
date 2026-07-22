-- Storage buckets for storefront and admin uploads.
-- Public buckets:
-- - site-assets: hero, logo, banner, favicon, and shared storefront media.
-- - product-media: product preview/detail/lifestyle images.
-- Keep both public because the storefront renders these assets directly.

insert into storage.buckets (id, name, public)
values
  ('site-assets', 'site-assets', true),
  ('product-media', 'product-media', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;
