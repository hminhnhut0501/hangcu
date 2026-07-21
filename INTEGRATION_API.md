# Integration API

The Telegram bot integration uses license-key endpoints and HMAC validation.

## Endpoints

- `POST /api/v1/integrations/licenses/redeem`
- `POST /api/v1/integrations/licenses/status`
- `POST /api/v1/integrations/licenses/revoke`

## Security model

- HMAC-SHA256 signatures
- Timestamp and nonce replay protection
- Shared secret validation
