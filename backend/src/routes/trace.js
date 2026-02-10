import express from "express";
import { query } from "express-validator";
import { listTraceTimeline } from "../data/store.js";
import { handleValidationResult } from "../middleware/validation.js";
import { canViewTrace } from "../services/rbac.js";

const router = express.Router();
const traceModes = new Set(["global", "filtered"]);
const traceFilterTypes = new Set(["sku", "epc", "grn", "do", "rma", "put", "asn", "adj", "location", "reference"]);
const pageSizeValues = ["10", "20", "50"];

function resolveWarehouseScope(roleId, sessionWarehouseId, requestedWarehouseId) {
  const requested = requestedWarehouseId ? String(requestedWarehouseId) : null;
  if (["storemanager", "storeoperator"].includes(roleId)) {
    if (requested && sessionWarehouseId && requested !== sessionWarehouseId) {
      return { error: "Requested warehouse scope is not permitted for this role" };
    }
    return { warehouseId: sessionWarehouseId || requested || null };
  }
  return { warehouseId: requested || null };
}

function inferLegacyReferenceType(referenceValue) {
  const normalized = String(referenceValue || "").trim().toUpperCase();
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith("GRN")) return "grn";
  if (normalized.startsWith("DO")) return "do";
  if (normalized.startsWith("RMA")) return "rma";
  if (normalized.startsWith("PUT")) return "put";
  if (normalized.startsWith("ASN")) return "asn";
  if (normalized.startsWith("ADJ")) return "adj";
  return "reference";
}

router.use((req, res, next) => {
  if (!canViewTrace(String(req.session?.role_id || "").toLowerCase())) {
    return res.status(403).json({ message: "You do not have permission to view trace history" });
  }
  return next();
});

router.get(
  "/events",
  [
    query("mode").optional().trim().toLowerCase().isIn(Array.from(traceModes)).withMessage("mode must be global or filtered"),
    query("type")
      .optional()
      .trim()
      .toLowerCase()
      .isIn(Array.from(traceFilterTypes))
      .withMessage(`type must be one of: ${Array.from(traceFilterTypes).join(", ")}`),
    query("value").optional().isString().trim(),
    query("warehouse_id").optional().isString().trim(),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("pageSize").optional().trim().isIn(pageSizeValues).withMessage(`pageSize must be one of: ${pageSizeValues.join(", ")}`),
    handleValidationResult,
  ],
  (req, res) => {
    const mode = String(req.query.mode || "global").toLowerCase();
    const type = String(req.query.type || "").toLowerCase();
    const value = String(req.query.value || "").trim();

    if (mode === "filtered" && (!type || !value)) {
      return res.status(400).json({ message: "type and value are required when mode=filtered" });
    }

    const scope = resolveWarehouseScope(
      String(req.session.role_id || "").toLowerCase(),
      req.session.warehouse_id,
      req.query.warehouse_id,
    );
    if (scope.error) {
      return res.status(403).json({ message: scope.error });
    }

    const result = listTraceTimeline({
      tenantId: req.session.tenant_id,
      mode,
      filterType: type,
      filterValue: value,
      warehouseId: scope.warehouseId,
      page: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 20),
    });

    return res.json(result);
  },
);

router.get(
  "/search",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("pageSize").optional().trim().isIn(pageSizeValues).withMessage(`pageSize must be one of: ${pageSizeValues.join(", ")}`),
    query("sku").optional().isString().trim(),
    query("epc").optional().isString().trim(),
    query("qrPayload").optional().isString().trim(),
    query("reference").optional().isString().trim(),
    handleValidationResult,
  ],
  (req, res) => {
    const sku = String(req.query.sku || "").trim();
    const epc = String(req.query.epc || "").trim();
    const reference = String(req.query.reference || "").trim();
    const qrPayload = String(req.query.qrPayload || "").trim();
    const scope = resolveWarehouseScope(
      String(req.session.role_id || "").toLowerCase(),
      req.session.warehouse_id,
      req.query.warehouse_id,
    );

    if (scope.error) {
      return res.status(403).json({ message: scope.error });
    }

    let mode = "global";
    let type = "";
    let value = "";

    if (sku) {
      mode = "filtered";
      type = "sku";
      value = sku;
    } else if (epc) {
      mode = "filtered";
      type = "epc";
      value = epc;
    } else if (reference) {
      mode = "filtered";
      type = inferLegacyReferenceType(reference);
      value = reference;
    } else if (qrPayload) {
      mode = "filtered";
      type = "reference";
      value = qrPayload;
    }

    const result = listTraceTimeline({
      tenantId: req.session.tenant_id,
      mode,
      filterType: type,
      filterValue: value,
      warehouseId: scope.warehouseId,
      page: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 20),
    });

    return res.json({
      items: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      pageSize: result.pagination.pageSize,
    });
  },
);

export default router;
