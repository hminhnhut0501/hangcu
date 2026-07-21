# Hang Cú Video License Store

License storefront for Hang Cú video with fulfillment, admin operations, and license delivery workflows.

## Tech Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase
- Vitest
- Playwright

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill required values.
3. Run `pnpm dev`.

## Available scripts

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Phase 2 scope

- Project foundation
- App Router structure
- Global layout
- Storefront and admin shell
- Catalog schema migration
- Catalog modules for collections, products, and prices
- Storefront product and collection pages

## Phase 3 scope

- Cart and checkout service foundations
- Order creation and lookup service foundations
- Checkout, orders, and fulfillment-prep pages

## Phase 4 scope

- Payment provider interface and sandbox/manual skeletons
- License plan types, reward rules, allocation, and redemption foundations
- Fulfillment and email hook abstractions

## Phase 5 scope

- HMAC-secured Telegram bot integration API
- Redeem, status, and revoke endpoints
- Replay protection and rate-limiting foundations

## Phase 6 scope

- Admin dashboard
- Coupon management
- Webhook monitoring
- Audit log foundation
- Hardening helpers for CSRF and role checks

## Phase 7 scope

- Supabase-backed repository adapters
- Admin CRUD persistence foundations
- Webhook retry endpoint
- Service-layer persistence fallbacks for local development

## Phase 8 scope

- Admin mutation authorization
- CSRF protection helpers for admin writes
- Audit hooks on admin mutation endpoints
- Additional mutation surfaces for status changes
- Webhook retry guarded by admin permission and CSRF token

## Phase 5 admin scope

- Admin pages for license plans, donate packages, and license keys
- Mutation endpoints for creating and updating license-domain records
- Existing coupon, audit, and webhook admin surfaces remain in place

## Phase 1 licensing scope

- Add license plans, donate packages, and license keys
- Keep the current payment, audit, and admin foundations untouched
- Prepare the codebase for a later bilingual storefront cutover

## Phase 3 licensing scope

- Fulfillment now resolves product-to-license-plan rules
- Orders are fulfilled with license keys

## Next steps

Phase 9 will focus on Supabase persistence, coupon/admin hardening cleanup, and content polish for the bilingual storefront.

## Deployment

Recommended free-tier layout:

- Vercel: Next.js web app
- Supabase Free: database, auth, storage
- Render Free: optional helper service only, not the primary checkout surface

Required environment variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_HMAC_SECRET`
- `NEXT_PUBLIC_APP_NAME`

Deployment order:

1. Create the Supabase project and apply the SQL migrations.
2. Add the env vars in Vercel.
3. Deploy the web app to Vercel from GitHub.
4. If you need Render, deploy only the helper service there and leave the web app on Vercel.
