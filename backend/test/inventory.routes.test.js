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
  body,
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
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

test("inventory summary is tenant scoped", async () => {
  const response = await apiRequest("/api/inventory/summary?page=1&pageSize=100", {
    tenant: "TNT000001",
    role: "superadmin",
  });

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.payload.items), true);
  assert.equal(response.payload.items.some((row) => row.location_id === "LOC100001"), false);
});

test("storeoperator can create and submit adjustment but cannot approve", async () => {
  const createResponse = await apiRequest("/api/inventory/adjustments", {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
    body: {
      sku_id: "SKU000001",
      location_id: "LOC000001",
      qty_delta: -4,
      reason_code: "DAMAGED",
    },
  });

  assert.equal(createResponse.status, 201);
  const adjId = createResponse.payload.adj_id;

  const submitResponse = await apiRequest(`/api/inventory/adjustments/${adjId}/submit`, {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
  });
  assert.equal(submitResponse.status, 200);
  assert.equal(submitResponse.payload.status, "SUBMITTED");

  const approveBlocked = await apiRequest(`/api/inventory/adjustments/${adjId}/approve`, {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
    body: { approval_note: "trying approve" },
  });
  assert.equal(approveBlocked.status, 403);
});

test("superadmin can approve submitted adjustment", async () => {
  const createResponse = await apiRequest("/api/inventory/adjustments", {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
    body: {
      sku_id: "SKU000002",
      location_id: "LOC000002",
      qty_delta: 2,
      reason_code: "MISCOUNTED",
    },
  });
  assert.equal(createResponse.status, 201);
  const adjId = createResponse.payload.adj_id;

  const submitResponse = await apiRequest(`/api/inventory/adjustments/${adjId}/submit`, {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
  });
  assert.equal(submitResponse.status, 200);

  const approveResponse = await apiRequest(`/api/inventory/adjustments/${adjId}/approve`, {
    method: "POST",
    role: "superadmin",
    user: "USR000001",
    body: { approval_note: "Approved for correction" },
  });

  assert.equal(approveResponse.status, 200);
  assert.equal(approveResponse.payload.status, "APPROVED");
});

test("count plan cancel requires reason", async () => {
  const response = await apiRequest("/api/inventory/count-plans/CC000015/cancel", {
    method: "POST",
    role: "storemanager",
    user: "USR000002",
    body: { reason: "no" },
  });

  assert.equal(response.status, 400);
});

test("count plan detail respects tenant scope", async () => {
  const response = await apiRequest("/api/inventory/count-plans/CC000015", {
    tenant: "TNT000002",
    role: "superadmin",
    user: "USR100001",
    warehouse: "WH000003",
  });

  assert.equal(response.status, 404);
});
