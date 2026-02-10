import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { once } from "node:events";
import { createApp } from "../src/server.js";

let server;
let baseUrl = "";

before(async () => {
  const app = createApp();
  server = app.listen(0);
  await once(server, "listening");
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) {
    return;
  }
  await new Promise((resolve) => server.close(resolve));
});

async function apiRequest(path, {
  method = "GET",
  tenant = "TNT000001",
  role = "superadmin",
  user = "USR000001",
  warehouse = "WH000001",
} = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenant,
      "x-role-id": role,
      "x-user-id": user,
      "x-warehouse-id": warehouse,
    },
  });

  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

test("trace events defaults to global mode with pagination", async () => {
  const response = await apiRequest("/api/trace/events?page=1&pageSize=20");

  assert.equal(response.status, 200);
  assert.equal(response.payload.mode, "global");
  assert.equal(response.payload.filter, null);
  assert.equal(Array.isArray(response.payload.data), true);
  assert.equal(typeof response.payload.pagination.total, "number");
  assert.equal(response.payload.pagination.page, 1);
  assert.equal(response.payload.pagination.pageSize, 20);
});

test("trace events supports filtered mode with context payload", async () => {
  const response = await apiRequest("/api/trace/events?mode=filtered&type=sku&value=SKU000001&page=1&pageSize=10");

  assert.equal(response.status, 200);
  assert.equal(response.payload.mode, "filtered");
  assert.equal(response.payload.filter.type, "sku");
  assert.equal(response.payload.filter.value, "SKU000001");
  assert.equal(response.payload.pagination.pageSize, 10);
  assert.equal(response.payload.pagination.total > 0, true);
  assert.equal(response.payload.data.every((item) => item.sku === "SKU000001"), true);
  assert.equal(typeof response.payload.context?.lastStatus, "string");
});

test("trace events blocks cross-tenant references in filtered mode", async () => {
  const response = await apiRequest("/api/trace/events?mode=filtered&type=grn&value=GRN100001&page=1&pageSize=20", {
    tenant: "TNT000001",
    role: "superadmin",
  });

  assert.equal(response.status, 200);
  assert.equal(response.payload.pagination.total, 0);
});

test("storeoperator cannot override warehouse scope using query param", async () => {
  const response = await apiRequest("/api/trace/events?mode=global&warehouse_id=WH000002&page=1&pageSize=20", {
    tenant: "TNT000001",
    role: "storeoperator",
    user: "USR000003",
    warehouse: "WH000001",
  });

  assert.equal(response.status, 403);
});

test("legacy trace search endpoint remains available", async () => {
  const response = await apiRequest("/api/trace/search?reference=GRN000143&page=1&pageSize=20", {
    tenant: "TNT000001",
    role: "auditor",
    user: "USR000001",
  });

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.payload.items), true);
  assert.equal(typeof response.payload.total, "number");
  assert.equal(response.payload.page, 1);
  assert.equal(response.payload.pageSize, 20);
});
