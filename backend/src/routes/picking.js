import express from "express";
import { body, param, query } from "express-validator";
import {
  getPickList,
  listPickLists,
  updatePickListStatusBySource,
} from "../data/store.js";
import { createSimpleRateLimiter } from "../middleware/rateLimit.js";
import { handleValidationResult } from "../middleware/validation.js";
import { recordAuditEvent } from "../services/auditLog.js";
import {
  canManagePacking,
  canUpdatePickingMobileStatus,
  canViewPicking,
} from "../services/rbac.js";

const router = express.Router();

const writeRateLimit = createSimpleRateLimiter({
  windowMs: 60_000,
  max: 50,
});

const PICK_LIST_FILTER_STATUSES = [
  "open",
  "draft",
  "picking",
  "picked",
  "verified",
  "completed",
  "packed",
  "shipped",
  "cancelled",
];
const MOBILE_PICK_STATUSES = ["picking", "picked", "verified", "completed"];
const PORTAL_PICK_STATUSES = ["packed", "shipped"];

function resolveWarehouseScope(roleId, warehouseId) {
  if (["storemanager", "storeoperator"].includes(roleId)) {
    return warehouseId || null;
  }
  return null;
}

function resolveSource(req) {
  return String(req.headers["x-client-source"] || "PORTAL").trim().toUpperCase();
}

function mapStatusError(errorMessage) {
  const safeMessage = String(errorMessage || "").toLowerCase();
  if (safeMessage.includes("not found")) {
    return 404;
  }
  if (safeMessage.includes("cannot") || safeMessage.includes("controlled")) {
    return 403;
  }
  return 400;
}

function toListItem(row) {
  return {
    pick_list_id: row.pick_list_id,
    wave_id: row.wave_id,
    assigned_to_user_id: row.assigned_to_user_id,
    assigned_to_user_name: row.assigned_to_user_name,
    status: row.status,
    priority: row.priority,
    lines_count: row.lines_count ?? (Array.isArray(row.lines) ? row.lines.length : 0),
    created_at: row.created_at,
    started_at: row.started_at,
    completed_at: row.completed_at,
    updated_at: row.updated_at,
    warehouse_id: row.warehouse_id,
  };
}

function toDetailItem(row) {
  return {
    ...toListItem(row),
    lines: Array.isArray(row.lines)
      ? row.lines.map((line) => ({
          line_no: line.line_no,
          sku_id: line.sku_id,
          location_id: line.location_id,
          qty_required: line.qty_required,
          qty_picked: line.qty_picked,
          status: line.status,
        }))
      : [],
  };
}

router.get(
  "/pick-lists",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("pageSize").optional().isInt({ min: 1, max: 100 }).withMessage("pageSize must be between 1 and 100"),
    query("search").optional().isString().trim(),
    query("status")
      .optional()
      .trim()
      .toLowerCase()
      .isIn(PICK_LIST_FILTER_STATUSES)
      .withMessage(`status must be one of: ${PICK_LIST_FILTER_STATUSES.join(", ")}`),
    query("waveId").optional().isString().trim(),
    query("assignedUser").optional().isString().trim(),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewPicking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view pick lists" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = listPickLists({
      tenantId: req.tenant_id,
      page: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 10),
      search: req.query.search || "",
      status: req.query.status || "",
      waveId: req.query.waveId || "",
      assignedUser: req.query.assignedUser || "",
      warehouseId: warehouseScope,
    });

    return res.json({
      items: result.items.map(toListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  },
);

router.get(
  "/pick-lists/:pickListId",
  [
    param("pickListId").matches(/^PCK\d{6}$/).withMessage("pickListId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewPicking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view pick lists" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const item = getPickList(req.tenant_id, req.params.pickListId, warehouseScope);
    if (!item) {
      return res.status(404).json({ message: "Pick list not found" });
    }

    return res.json(toDetailItem(item));
  },
);

router.post(
  "/pick-lists/:pickListId/status",
  writeRateLimit,
  [
    param("pickListId").matches(/^PCK\d{6}$/).withMessage("pickListId format is invalid"),
    body("status")
      .trim()
      .isIn([...MOBILE_PICK_STATUSES, ...PORTAL_PICK_STATUSES])
      .withMessage("status is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    const source = resolveSource(req);
    if (!["MOBILE", "PORTAL"].includes(source)) {
      return res.status(400).json({ message: "x-client-source must be MOBILE or PORTAL" });
    }

    if (source === "MOBILE" && !canUpdatePickingMobileStatus(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to update mobile picking statuses" });
    }

    if (source === "PORTAL" && !canManagePacking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to update portal pick list statuses" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = updatePickListStatusBySource({
      tenantId: req.tenant_id,
      pickListId: req.params.pickListId,
      status: req.body.status,
      source,
      userId: req.session.user_id,
      warehouseId: warehouseScope,
    });

    if (result.error) {
      return res.status(mapStatusError(result.error)).json({ message: result.error });
    }

    recordAuditEvent({
      tenant_id: req.tenant_id,
      user_id: req.session.user_id,
      entity_type: "pick_list",
      entity_id: req.params.pickListId,
      action: "status_update",
      source,
      message: `Pick list status updated to ${result.data.status}`,
    });

    return res.json({
      success: true,
      message: `Pick list ${req.params.pickListId} updated to ${result.data.status}`,
      pick_list: toDetailItem(result.data),
    });
  },
);

router.post(
  "/pick-lists/:pickListId/execute",
  writeRateLimit,
  [
    param("pickListId").matches(/^PCK\d{6}$/).withMessage("pickListId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    const source = resolveSource(req);
    if (source === "PORTAL") {
      return res.status(403).json({ message: "Pick execution is mobile-only. Portal cannot execute pick tasks." });
    }
    return res.status(410).json({ message: "Use MOBILE API for pick execution updates" });
  },
);

router.post(
  "/pick-lists/:pickListId/verify-item",
  writeRateLimit,
  [
    param("pickListId").matches(/^PCK\d{6}$/).withMessage("pickListId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    const source = resolveSource(req);
    if (source === "PORTAL") {
      return res.status(403).json({ message: "Item-level verification is mobile-only and unavailable on portal API." });
    }
    return res.status(410).json({ message: "Use MOBILE API for item-level verification" });
  },
);

export default router;
