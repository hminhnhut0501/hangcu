# Architecture

## Goals

- Keep business logic out of React components.
- Separate storefront, admin, and API surfaces.
- Centralize validation and service-layer logic in modules.
- Treat Hang Cú video licensing as the primary domain.
- Support English and Vietnamese storefront and email content.

## Directory layout

```text
src/
  app/
    (storefront)/
    admin/
    api/
  components/
  modules/
  lib/
  providers/
```

## Phase 1 decisions

- Use App Router for all UI and API entry points.
- Use strict TypeScript to keep future service code predictable.
- Reserve `modules/` for business logic and data access.
- Reserve `lib/` for reusable infrastructure helpers.

## Phase 2 additions

- Catalog schema is introduced via SQL migration.
- Collections, products, and prices use repository/service separation.
- Storefront pages consume services rather than inline data shaping.

## Phase 3 additions

- Cart and checkout logic are split into dedicated modules.
- Order creation is service-driven and stores snapshots.
- Storefront checkout and order lookup remain thin UI shells.

## Phase 4 additions

- Payment providers are isolated behind a shared interface.
- License allocation is driven by reward rules.
- Fulfillment coordinates order, license key, download, and email hooks.

## Phase 5 additions

- Integration API uses HMAC request validation and replay protection.
- Route handlers stay thin and delegate to module services.
- Responses follow a stable success/error envelope for bot consumption.

## Phase 6 additions

- Admin pages consume dashboard, coupon, webhook, and audit services.
- Hardening helpers cover CSRF token checks and admin role thresholds.
- Mutation-ready surfaces remain server-side only.

## Phase 7 additions

- Repositories can now target Supabase or fall back to in-memory stores.
- Admin-facing data access paths are centralized through service-layer adapters.
- Webhook retries are exposed through a dedicated route handler.

## Phase 8 additions

- Admin write routes require permission and CSRF checks.
- Audit logging is emitted from admin mutations and webhook retries.
- Status mutations are split into dedicated endpoints.

## Phase 3 licensing additions

- Product-to-license rules drive fulfillment.
- Fulfillment issues license keys from licensed plans.
