# Database

This repository is currently in Phase 8. The canonical schema now uses license terminology, and the earliest fulfillment migration is archived as reference.

## Planned foundations

- UUID primary keys
- UTC timestamps
- Supabase PostgreSQL
- Private storage for licensed software assets and installer files

## Added in Phase 2

- `collections`
- `products`
- `product_media`
- `prices`

## Added in Phase 4

- Archived fulfillment schema reference
- `downloads`

## Phase 5 notes

- Integration API state is currently held in memory for nonce and rate-limit tracking.
- Production hardening will move these concerns into persistent storage or cache.

## Added in Phase 6

- `coupons`
- `audit_logs`
- `payment_events`

## Phase 7 notes

- Persistence adapters now map these tables through Supabase clients when environment variables are present.
- Local development can still fall back to in-memory repositories.

## Notes

- The archived fulfillment migration is kept as reference, while `20260721000500_rename_legacy_gift_codes_to_license_keys.sql` documents the canonical rename path.
- Production data access will later move from in-memory repositories to database-backed repositories.
- The canonical schema uses license plans, donate packages, and license keys.
