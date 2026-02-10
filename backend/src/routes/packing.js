import express from "express";
import { body, param, query } from "express-validator";
import {
  confirmPackingOrder,
  createPackingCarton,
  generatePackingCartonLabel,
  getPackOrder,
  getPickList,
  listPackOrders,
  listPackagingTypes,
} from "../data/store.js";
import { createSimpleRateLimiter } from "../middleware/rateLimit.js";
import { handleValidationResult } from "../middleware/validation.js";
import { recordAuditEvent } from "../services/auditLog.js";
import {
  canManagePacking,
  canViewPacking,
} from "../services/rbac.js";

const router = express.Router();

const writeRateLimit = createSimpleRateLimiter({
  windowMs: 60_000,
  max: 50,
});

function resolveWarehouseScope(roleId, warehouseId) {
  if (["storemanager", "storeoperator"].includes(roleId)) {
    return warehouseId || null;
  }
  return null;
}

function resolveSource(req) {
  return String(req.headers["x-client-source"] || "PORTAL").trim().toUpperCase();
}

function mapErrorToStatus(errorMessage) {
  const safeMessage = String(errorMessage || "").toLowerCase();
  if (safeMessage.includes("not found")) {
    return 404;
  }
  if (safeMessage.includes("only start") || safeMessage.includes("only portal")) {
    return 409;
  }
  return 400;
}

function toPackListItem(row) {
  return {
    pack_id: row.pack_id,
    pick_list_id: row.pick_list_id,
    carton_id: row.carton_id,
    packaging_type: row.packaging_type,
    weight_kg: row.weight_kg,
    status: row.status,
    pick_list_status: row.pick_list_status || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    packed_at: row.packed_at,
    label_generated_at: row.label_generated_at,
    warehouse_id: row.warehouse_id,
  };
}

function toPackDetailItem(row, pickListStatus = null) {
  return {
    ...toPackListItem({
      ...row,
      pick_list_status: pickListStatus || row.pick_list_status || null,
    }),
    lines: Array.isArray(row.lines)
      ? row.lines.map((line) => ({
          line_no: line.line_no,
          sku_id: line.sku_id,
          qty: line.qty,
        }))
      : [],
  };
}

function getPackDetail(tenantId, packId, warehouseScope) {
  const item = getPackOrder(tenantId, packId, warehouseScope);
  if (!item) {
    return null;
  }
  const pickList = getPickList(tenantId, item.pick_list_id, warehouseScope);
  return toPackDetailItem(item, pickList?.status || null);
}

router.get(
  "/orders",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("pageSize").optional().isInt({ min: 1, max: 100 }).withMessage("pageSize must be between 1 and 100"),
    query("search").optional().isString().trim(),
    query("status").optional().isString().trim(),
    query("pickListId").optional().isString().trim(),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewPacking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view packing orders" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = listPackOrders({
      tenantId: req.tenant_id,
      page: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 10),
      search: req.query.search || "",
      status: req.query.status || "",
      pickListId: req.query.pickListId || "",
      warehouseId: warehouseScope,
    });

    return res.json({
      items: result.items.map(toPackListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  },
);

router.get("/options", (req, res) => {
  if (!canViewPacking(req.session.role_id)) {
    return res.status(403).json({ message: "You do not have permission to view packing options" });
  }
  return res.json({
    packaging_types: listPackagingTypes(req.tenant_id),
  });
});

router.get(
  "/orders/:packId",
  [
    param("packId").matches(/^PAK\d{6}$/).withMessage("packId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewPacking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view packing orders" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const detail = getPackDetail(req.tenant_id, req.params.packId, warehouseScope);
    if (!detail) {
      return res.status(404).json({ message: "Pack order not found" });
    }

    return res.json(detail);
  },
);

router.post(
  "/orders/:packId/create-carton",
  writeRateLimit,
  [
    param("packId").matches(/^PAK\d{6}$/).withMessage("packId format is invalid"),
    body("packaging_type").trim().isLength({ min: 1 }).withMessage("packaging_type is required"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canManagePacking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to create cartons" });
    }

    const source = resolveSource(req);
    if (source !== "PORTAL") {
      return res.status(403).json({ message: "Carton creation is restricted to PORTAL source" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = createPackingCarton({
      tenantId: req.tenant_id,
      packId: req.params.packId,
      packagingType: req.body.packaging_type,
      source,
      userId: req.session.user_id,
      warehouseId: warehouseScope,
    });

    if (result.error) {
      return res.status(mapErrorToStatus(result.error)).json({ message: result.error });
    }

    recordAuditEvent({
      tenant_id: req.tenant_id,
      user_id: req.session.user_id,
      entity_type: "pack_order",
      entity_id: req.params.packId,
      action: "create_carton",
      source,
      message: `Carton ${result.data.carton_id} created`,
    });

    return res.json({
      success: true,
      message: `Carton ${result.data.carton_id} created successfully`,
      order: getPackDetail(req.tenant_id, req.params.packId, warehouseScope),
    });
  },
);

router.post(
  "/orders/:packId/generate-label",
  writeRateLimit,
  [
    param("packId").matches(/^PAK\d{6}$/).withMessage("packId format is invalid"),
    body("weight_kg")
      .optional({ values: "falsy" })
      .isFloat({ gt: 0 })
      .withMessage("weight_kg must be a positive number"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canManagePacking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to generate carton labels" });
    }

    const source = resolveSource(req);
    if (source !== "PORTAL") {
      return res.status(403).json({ message: "Label generation is restricted to PORTAL source" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = generatePackingCartonLabel({
      tenantId: req.tenant_id,
      packId: req.params.packId,
      weightKg: req.body.weight_kg,
      source,
      userId: req.session.user_id,
      warehouseId: warehouseScope,
    });

    if (result.error) {
      return res.status(mapErrorToStatus(result.error)).json({ message: result.error });
    }

    recordAuditEvent({
      tenant_id: req.tenant_id,
      user_id: req.session.user_id,
      entity_type: "pack_order",
      entity_id: req.params.packId,
      action: "generate_carton_label",
      source,
      message: "Carton label generated",
    });

    return res.json({
      success: true,
      message: "Carton label generated successfully",
      order: getPackDetail(req.tenant_id, req.params.packId, warehouseScope),
    });
  },
);

router.post(
  "/orders/:packId/confirm-pack",
  writeRateLimit,
  [
    param("packId").matches(/^PAK\d{6}$/).withMessage("packId format is invalid"),
    body("weight_kg")
      .exists({ values: "falsy" })
      .withMessage("weight_kg is required")
      .bail()
      .isFloat({ gt: 0 })
      .withMessage("weight_kg must be a positive number"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canManagePacking(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to confirm packing" });
    }

    const source = resolveSource(req);
    if (source !== "PORTAL") {
      return res.status(403).json({ message: "Packing confirmation is restricted to PORTAL source" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = confirmPackingOrder({
      tenantId: req.tenant_id,
      packId: req.params.packId,
      weightKg: req.body.weight_kg,
      source,
      userId: req.session.user_id,
      warehouseId: warehouseScope,
    });

    if (result.error) {
      return res.status(mapErrorToStatus(result.error)).json({ message: result.error });
    }

    recordAuditEvent({
      tenant_id: req.tenant_id,
      user_id: req.session.user_id,
      entity_type: "pack_order",
      entity_id: req.params.packId,
      action: "confirm_packing",
      source,
      message: "Pack order confirmed as packed",
    });

    return res.json({
      success: true,
      message: `Pack order ${req.params.packId} marked as PACKED`,
      order: getPackDetail(req.tenant_id, req.params.packId, warehouseScope),
    });
  },
);

export default router;
