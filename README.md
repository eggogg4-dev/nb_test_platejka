# Paymtech Backend (Sandbox)

Production-ready Express server that integrates with Paymtech (sandbox) using client certificate (p12) and optional Basic auth.

> ⚠️ Update the exact API paths/fields according to official Paymtech docs. In this template, the paths default to `/v1/orders` and `/v1/orders/{orderId}`; override with env vars if needed.

## Quick Start (Local)

1. **Requirements**
   - Node.js >= 18.18
   - The sandbox client certificate file (`.p12`) from Paymtech.

2. **Install**
   ```bash
   npm ci
   cp .env.example .env
   # Edit .env to add your credentials and p12 passphrase
   ```

3. **Place certificate**
   - Put your `.p12` file into `./certs/` (already included here as `neuroboost.p12` if you uploaded it).

4. **Run**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

## API

### Create Order
`POST /api/create-order`

**Body (example):**
```json
{
  "amount": 500,
  "currency": "KZT",
  "merchant_order_id": "order-0001",
  "description": "Test payment",
  "return_url": "https://your-site/success",
  "callback_url": "https://your-api/api/webhook/paymtech",
  "extra": { "customer_email": "user@example.com" }
}
```

**PowerShell example:**
```powershell
Invoke-RestMethod -Method POST "http://localhost:3000/api/create-order" `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body (@{
    amount = 500;
    currency = "KZT";
    merchant_order_id = "order-0001";
    description = "Test payment";
    return_url = "https://example.com/pay/success";
    callback_url = "https://api.example.com/api/webhook/paymtech"
  } | ConvertTo-Json)
```

### Get Order Status
`GET /api/status/:order_id`

```bash
curl http://localhost:3000/api/status/REPLACE_WITH_ID
```

### Webhook (Callback from Paymtech)
`POST /api/webhook/paymtech`

- If Paymtech sends an HMAC signature header (for example, `X-Signature`), set `PAYMTECH_WEBHOOK_SECRET` in `.env` and the endpoint will verify it.

## Docker (Production)

```bash
docker build -t paymtech-backend .
docker run --rm -it -p 3000:3000 --env-file .env -v $(pwd)/certs:/app/certs:ro paymtech-backend
```

Or via compose:
```bash
docker-compose up --build -d
```

## Configuration (.env)

- `PAYMTECH_BASE_URL` — Sandbox API base URL (default `https://sandboxapi.paymtech.kz`)
- `PAYMTECH_ORDER_CREATE_PATH` — Create order path (default `/v1/orders`)
- `PAYMTECH_ORDER_STATUS_PATH` — Status path (default `/v1/orders/{orderId}`)
- `PAYMTECH_PROJECT` — Project name (e.g., `neuroboost`)
- `PAYMTECH_USERNAME` / `PAYMTECH_PASSWORD` — If project requires Basic auth
- `PAYMTECH_P12_FILE` — Path to your p12 file (default `./certs/neuroboost.p12`)
- `PAYMTECH_P12_PASSPHRASE` — Passphrase for the p12 file
- `PAYMTECH_WEBHOOK_SECRET` — Optional secret for webhook signature verification

> NOTE: If Paymtech uses different headers or auth flows, update `src/services/paymtech.js` accordingly.

## Mapping Notes

This template sends a `POST` to `PAYMTECH_ORDER_CREATE_PATH` with:
```json
{
  "amount": 500,
  "currency": "KZT",
  "merchant_order_id": "order-0001",
  "description": "Test payment",
  "return_url": "https://your-site/success",
  "callback_url": "https://your-api/api/webhook/paymtech",
  "extra": {}
}
```
Adjust fields to match Paymtech's spec (e.g., `amount` in kopeks/tiyn vs whole currency units).

## Security

- Never commit `.env` or `.p12` files.
- Restrict webhook endpoint by IP allowlist if Paymtech publishes callback IPs.
- Validate and sanitize all inputs in `/api/create-order`.

## Deploy Tips

- Use reverse proxy (Nginx) or a platform (Render/Fly/Heroku/VM) with HTTPS termination.
- Mount the `certs` directory read-only.
- Keep system clock synced for TLS.

