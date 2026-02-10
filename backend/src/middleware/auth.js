import { isKnownTenant } from "../data/store.js";

const roleAliases = {
  superadmin: "superadmin",
  hqadmin: "hqadmin",
  storemanager: "storemanager",
  storeoperator: "storeoperator",
  warehouseadmin: "storemanager",
  warehousemanager: "storemanager",
  storekeeper: "storeoperator",
  warehouseclerk: "storeoperator",
  auditor: "auditor",
  readonly: "readonly",
};

function normalizeRoleId(roleId) {
  const normalized = String(roleId || "readonly").toLowerCase();
  return roleAliases[normalized] || "readonly";
}

function decodeBase64Url(input) {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    return Buffer.from(base64 + padding, "base64").toString("utf8");
  } catch (_error) {
    return null;
  }
}

function parseBearerPayload(authHeader) {
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  const jwtParts = token.split(".");
  if (jwtParts.length === 3) {
    const payloadText = decodeBase64Url(jwtParts[1]);
    if (!payloadText) {
      return null;
    }

    try {
      return JSON.parse(payloadText);
    } catch (_error) {
      return null;
    }
  }

  const decoded = decodeBase64Url(token);
  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded);
  } catch (_error) {
    return null;
  }
}

function sessionMiddleware(req, res, next) {
  const tokenPayload = parseBearerPayload(req.headers.authorization);
  const tenantId =
    req.headers["x-tenant-id"] ||
    tokenPayload?.tenant_id ||
    tokenPayload?.tenantId ||
    tokenPayload?.org_id ||
    tokenPayload?.orgId;

  if (!tenantId) {
    return res.status(401).json({ message: "Missing tenant context" });
  }

  if (!isKnownTenant(tenantId)) {
    return res.status(403).json({ message: "Tenant is not authorized" });
  }

  const userId = req.headers["x-user-id"] || tokenPayload?.user_id || tokenPayload?.sub || "USRMOCK001";
  const roleId = normalizeRoleId(req.headers["x-role-id"] || tokenPayload?.role_id || tokenPayload?.role || "readonly");
  const warehouseId = req.headers["x-warehouse-id"] || tokenPayload?.warehouse_id || tokenPayload?.warehouseId || null;

  req.session = {
    tenant_id: tenantId,
    user_id: String(userId),
    role_id: roleId,
    warehouse_id: warehouseId ? String(warehouseId) : null,
  };
  req.tenant_id = tenantId;

  return next();
}

export { normalizeRoleId, roleAliases, sessionMiddleware };
