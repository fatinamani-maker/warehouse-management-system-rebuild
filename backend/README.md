# Backend Stub API (v1)

This backend is a **DB-free scaffold** for web and mobile clients.

- Base URL: `http://localhost:5000/api/v1`
- Auth: Clerk JWT (`Authorization: Bearer <token>`)
- Non-production stub mode: when `NODE_ENV != production`, you may pass:
  - `x-tenant-id`
  - `x-user-id`
  - `x-roles` (comma-separated lowercase role ids)
  - `x-permissions` (comma-separated permissions)

All responses use a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "...",
    "tenantId": "...",
    "timestamp": "..."
  }
}
```

List endpoints include `meta.pagination`.

## Run

From `backend/`:

```bash
npm install
npm run dev
```

The server reads a **unified root `.env`** at `../.env`.

## Example cURL

### 1) `/me`

```bash
curl -X GET "http://localhost:5000/api/v1/me" \
  -H "x-tenant-id: TN000001" \
  -H "x-user-id: USR000001" \
  -H "x-roles: superadmin"
```

### 2) `/lov/suppliers`

```bash
curl -X GET "http://localhost:5000/api/v1/lov/suppliers" \
  -H "x-tenant-id: TN000001" \
  -H "x-user-id: USR000001" \
  -H "x-roles: hqadmin"
```

### 3) `/putaway/scan`

```bash
curl -X POST "http://localhost:5000/api/v1/putaway/scan" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: TN000001" \
  -H "x-user-id: USR000101" \
  -H "x-roles: storemanager" \
  -d '{
    "taskId": "PUT000001",
    "barcode": "BC123456",
    "rfid": "RFID-TAG-0001",
    "locationCode": "A-01-01"
  }'
```

### 4) `/trace/qr/:code`

```bash
curl -X GET "http://localhost:5000/api/v1/trace/qr/QR-001-ABC" \
  -H "x-tenant-id: TN000001" \
  -H "x-user-id: USR000201" \
  -H "x-roles: storemanager"
```

## OpenAPI

- Spec file: `backend/docs/openapi.yaml`
