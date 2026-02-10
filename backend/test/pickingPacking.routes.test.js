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
  role = "storemanager",
  user = "USR000002",
  warehouse = "WH000001",
  source = "PORTAL",
} = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenant,
      "x-role-id": role,
      "x-user-id": user,
      "x-warehouse-id": warehouse,
      "x-client-source": source,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

test("GET /api/picking/pick-lists is tenant scoped", async () => {
  const response = await apiRequest("/api/picking/pick-lists?page=1&pageSize=50", {
    tenant: "TNT000001",
    role: "superadmin",
    user: "USR000001",
  });

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.payload.items), true);
  assert.equal(response.payload.items.some((item) => item.pick_list_id === "PCK100001"), false);
});

test("PORTAL source cannot update mobile-owned picking status", async () => {
  const response = await apiRequest("/api/picking/pick-lists/PCK000077/status", {
    method: "POST",
    role: "storemanager",
    user: "USR000002",
    source: "PORTAL",
    body: { status: "picked" },
  });

  assert.equal(response.status, 403);
});

test("MOBILE source can update picking status", async () => {
  const response = await apiRequest("/api/picking/pick-lists/PCK000077/status", {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
    source: "MOBILE",
    body: { status: "picked" },
  });

  assert.equal(response.status, 200);
  assert.equal(response.payload.pick_list.status, "picked");
});

test("packing create carton requires completed pick list status", async () => {
  const response = await apiRequest("/api/packing/orders/PAK000034/create-carton", {
    method: "POST",
    role: "storemanager",
    user: "USR000002",
    source: "PORTAL",
    body: { packaging_type: "standard_box" },
  });

  assert.equal(response.status, 409);
});

test("storeoperator cannot run packing control actions", async () => {
  const response = await apiRequest("/api/packing/orders/PAK000033/create-carton", {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
    source: "PORTAL",
    body: { packaging_type: "standard_box" },
  });

  assert.equal(response.status, 403);
});

test("storemanager can confirm pack order when pick list is completed", async () => {
  const response = await apiRequest("/api/packing/orders/PAK000033/confirm-pack", {
    method: "POST",
    role: "storemanager",
    user: "USR000002",
    source: "PORTAL",
    body: { weight_kg: 6.25 },
  });

  assert.equal(response.status, 200);
  assert.equal(response.payload.order.status, "packed");
  assert.equal(response.payload.order.pick_list_status, "packed");
});
