# Telegram bot checkout payload

Use one canonical endpoint for bot-originated purchases:

`POST /api/bot/checkout`

## Required fields

```json
{
  "orderId": "ORD-TELE-0001",
  "telegramUserId": "123456789",
  "planCode": "FULL_1M",
  "currency": "VND",
  "timestamp": 1785210000,
  "nonce": "a1b2c3d4e5f6g7h8",
  "signature": "hmac_sha256(orderId|telegramUserId|timestamp|nonce)"
}
```

## Optional fields

```json
{
  "customerRef": "tg:123456789",
  "vipPlanCode": "G1:1M",
  "amountMinor": 199000,
  "locale": "vi",
  "activationCode": "HANGCU-XXXX-XXXX-XXXX",
  "returnUrl": "https://hangcu.vercel.app/checkout?order=ORD-TELE-0001",
  "cancelUrl": "https://hangcu.vercel.app/checkout?order=ORD-TELE-0001",
  "source": "prive_bot",
  "paymentSessionId": "ps_ORDTELE0001_ABC123",
  "vipGroupIds": "tg_group_1,tg_group_2"
}
```

## Notes

- `planCode` is the current canonical license code.
- Legacy bot codes like `HCV_30D`, `HCV_LIFETIME`, `HCV-LIC-30`, `HCV-LIC-LIFE`, or `G1:1M` are still accepted and normalized by the backend.
- `vipPlanCode` is kept for bot compatibility when you want to preserve the original Telegram group token.
- `vipGroupIds` is optional and can be sent as a comma-separated or newline-separated string.
- The API will auto-pick the correct payment provider from site settings, so the bot only needs to send the plan and currency.
