# Warehouse Management System

This repository is split into:

- `frontend`: React (Vite) app on port `5173`
- `backend`: Node.js (Express) API on port `5000`

Environment variables are loaded from a unified root `.env` file (not committed).

## Install

```sh
npm install --prefix frontend
npm install --prefix backend
```

## Run

```sh
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

## Available scripts

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build:frontend`
- `npm run lint:frontend`
- `npm run test:frontend`
- `npm run start:backend`
- `npm --prefix backend run test`

## Trace Timeline behavior

- `/trace` defaults to a **GLOBAL** feed (`/trace` with no query params).
- Filtered deep-links use query params:
  - Example: `/trace?mode=filtered&type=sku&value=SKU000001`
- Pagination is supported in both modes with:
  - `page`
  - `pageSize` (`10`, `20`, `50`)
- Backend API contract:
  - `GET /api/trace/events?mode=global|filtered&type=...&value=...&page=...&pageSize=...`
