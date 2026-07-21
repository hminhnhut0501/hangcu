# Security

Phase 1 security goals:

- Strict server-side validation
- Secure auth boundaries
- No secrets in source control
- Environment variables documented in `.env.example`

## Later phases

- CSRF protection for admin mutations
- Webhook signature verification
- Replay protection for integration APIs
- Signed download URLs
