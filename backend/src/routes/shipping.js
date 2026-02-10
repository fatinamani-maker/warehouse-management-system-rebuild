import express from "express";
import { query } from "express-validator";
import { listShipments } from "../data/store.js";
import { handleValidationResult } from "../middleware/validation.js";
import { canViewShipping } from "../services/rbac.js";

const router = express.Router();

const allowedStatuses = [
  "open",
  "overdue",
  "pending",
  "ready",
  "packed",
  "carton_generated",
  "dispatched",
  "closed",
  "cancelled",
];

function resolveWarehouseScope(roleId, warehouseId) {
  if (["storemanager", "storeoperator"].includes(roleId)) {
    return warehouseId || null;
  }
  return null;
}

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("pageSize").optional().isInt({ min: 1, max: 100 }).withMessage("pageSize must be between 1 and 100"),
    query("search").optional().isString().trim(),
    query("carrier").optional().isString().trim(),
    query("status")
      .optional()
      .trim()
      .toLowerCase()
      .isIn(allowedStatuses)
      .withMessage(`status must be one of: ${allowedStatuses.join(", ")}`),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewShipping(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view shipments" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = listShipments({
      tenantId: req.tenant_id,
      page: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 10),
      search: req.query.search || "",
      status: req.query.status || "",
      carrier: req.query.carrier || "",
      warehouseId: warehouseScope,
    });

    return res.json({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  },
);

export default router;
