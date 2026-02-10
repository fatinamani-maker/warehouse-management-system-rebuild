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

test("GET /api/putaway-tasks is tenant scoped", async () => {
  const response = await apiRequest("/api/putaway-tasks?page=1&pageSize=20", {
    tenant: "TNT000001",
    role: "superadmin",
  });

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.payload.items), true);
  assert.equal(response.payload.items.some((item) => item.task_id === "PUT000310"), false);
});

test("storeoperator cannot assign putaway task", async () => {
  const response = await apiRequest("/api/putaway-tasks/PUT000210/assign", {
    method: "POST",
    role: "storeoperator",
    user: "USR000003",
    body: { assignedToUserId: "USR000004" },
  });

  assert.equal(response.status, 403);
});

test("superadmin can assign putaway task", async () => {
  const response = await apiRequest("/api/putaway-tasks/PUT000210/assign", {
    method: "POST",
    role: "superadmin",
    user: "USR000001",
    body: { assignedToUserId: "USR000003" },
  });

  assert.equal(response.status, 200);
  assert.equal(response.payload.task.assigned_to_user_id, "USR000003");
  assert.equal(response.payload.task.status, "in_progress");
});

test("cross-tenant detail lookup is blocked", async () => {
  const response = await apiRequest("/api/putaway-tasks/PUT000310", {
    tenant: "TNT000001",
    role: "superadmin",
  });

  assert.equal(response.status, 404);
});

test("mark exception requires reason", async () => {
  const response = await apiRequest("/api/putaway-tasks/PUT000211/mark-exception", {
    method: "POST",
    role: "storemanager",
    user: "USR000002",
    body: { reason: "bad" },
  });

  assert.equal(response.status, 400);
});
