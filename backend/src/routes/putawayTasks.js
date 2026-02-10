import express from "express";
import { body, param, query } from "express-validator";
import {
  assignPutawayTask,
  getPutawayTask,
  listAssignableOperators,
  listPutawayTaskEvents,
  listPutawayTasks,
  markPutawayTaskException,
  recomputePutawaySuggestedBin,
} from "../data/store.js";
import { createSimpleRateLimiter } from "../middleware/rateLimit.js";
import { handleValidationResult } from "../middleware/validation.js";
import { recordAuditEvent } from "../services/auditLog.js";
import {
  canAssignPutaway,
  canMarkPutawayException,
  canRecomputePutawayBin,
  canViewPutaway,
  canViewPutawayHistory,
} from "../services/rbac.js";

const router = express.Router();

const writeRateLimit = createSimpleRateLimiter({ windowMs: 60_000, max: 30 });
const allowedPutawayStatuses = ["pending", "in_progress", "completed", "exception"];
const allowedPutawayPriorities = ["high", "medium", "low"];

function resolveWarehouseScope(roleId, warehouseId) {
  if (["storemanager", "storeoperator"].includes(roleId)) {
    return warehouseId || null;
  }
  return null;
}

function toListItem(row) {
  return {
    task_id: row.task_id,
    grn_id: row.grn_id,
    sku_id: row.sku_id,
    qty: row.qty,
    source_location: row.source_location,
    suggested_bin: row.suggested_bin,
    actual_bin_code: row.actual_bin_code,
    priority: row.priority,
    status: row.status,
    assigned_to_user_id: row.assigned_to_user_id,
    assigned_to_user_name: row.assigned_to_user_name,
    updated_at: row.updated_at,
    warehouse_id: row.warehouse_id,
  };
}

function toDetailItem(row) {
  return {
    ...toListItem(row),
    created_at: row.created_at,
    started_at: row.started_at,
    completed_at: row.completed_at,
    device_type: row.device_type,
    exception_reason: row.exception_reason,
    execution: {
      assigned_to: row.assigned_to_user_name || "Unassigned",
      started_at: row.started_at,
      completed_at: row.completed_at,
      actual_bin: row.actual_bin_code,
      device_type: row.device_type,
    },
    evidence_summary: {
      scan_method: row.scan_method,
      epc_expected_count: row.epc_expected_count,
      epc_confirmed_count: row.epc_confirmed_count,
      validation_result: row.validation_result,
      exception_reason: row.status === "exception" ? row.exception_reason : null,
    },
  };
}

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("pageSize").optional().isInt({ min: 1, max: 100 }).withMessage("pageSize must be between 1 and 100"),
    query("search").optional().isString().trim(),
    query("status")
      .optional()
      .trim()
      .toLowerCase()
      .isIn(allowedPutawayStatuses)
      .withMessage(`status must be one of: ${allowedPutawayStatuses.join(", ")}`),
    query("priority")
      .optional()
      .trim()
      .toLowerCase()
      .isIn(allowedPutawayPriorities)
      .withMessage(`priority must be one of: ${allowedPutawayPriorities.join(", ")}`),
    query("source").optional().isString().trim(),
    query("suggestedBin").optional().isString().trim(),
    query("grn").optional().isString().trim(),
    query("sku").optional().isString().trim(),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewPutaway(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view putaway tasks" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = listPutawayTasks({
      tenantId: req.tenant_id,
      page: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 10),
      search: req.query.search || "",
      filters: {
        status: req.query.status || "",
        priority: req.query.priority || "",
        source: req.query.source || "",
        suggestedBin: req.query.suggestedBin || "",
        grn: req.query.grn || "",
        sku: req.query.sku || "",
      },
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

router.get("/operators", (req, res) => {
  if (!canViewPutaway(req.session.role_id)) {
    return res.status(403).json({ message: "You do not have permission to view operators" });
  }

  const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
  const operators = listAssignableOperators(req.tenant_id, warehouseScope);
  return res.json(operators);
});

router.get(
  "/:taskId",
  [
    param("taskId").matches(/^PUT\d{6}$/).withMessage("taskId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewPutaway(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view putaway tasks" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const item = getPutawayTask(req.tenant_id, req.params.taskId, warehouseScope);
    if (!item) {
      return res.status(404).json({ message: "Putaway task not found" });
    }

    return res.json(toDetailItem(item));
  },
);

router.post(
  "/:taskId/assign",
  writeRateLimit,
  [
    param("taskId").matches(/^PUT\d{6}$/).withMessage("taskId format is invalid"),
    body("assignedToUserId")
      .trim()
      .matches(/^USR\d{6}$/)
      .withMessage("assignedToUserId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canAssignPutaway(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to assign putaway tasks" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = assignPutawayTask({
      tenantId: req.tenant_id,
      taskId: req.params.taskId,
      assignedToUserId: req.body.assignedToUserId,
      actorUserId: req.session.user_id,
      warehouseId: warehouseScope,
    });

    if (result.error) {
      return res.status(result.error === "Task not found" ? 404 : 400).json({ message: result.error });
    }

    recordAuditEvent({
      tenant_id: req.tenant_id,
      user_id: req.session.user_id,
      entity_type: "putaway_task",
      entity_id: req.params.taskId,
      action: "assign",
      message: `Task assigned to ${result.data.assigned_to_user_id}`,
    });

    return res.json({
      success: true,
      message: "Task assigned successfully",
      task: toDetailItem(result.data),
    });
  },
);

router.post(
  "/:taskId/recompute-bin",
  writeRateLimit,
  [
    param("taskId").matches(/^PUT\d{6}$/).withMessage("taskId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canRecomputePutawayBin(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to recompute suggested bins" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = recomputePutawaySuggestedBin({
      tenantId: req.tenant_id,
      taskId: req.params.taskId,
      actorUserId: req.session.user_id,
      warehouseId: warehouseScope,
    });

    if (result.error) {
      return res.status(result.error === "Task not found" ? 404 : 400).json({ message: result.error });
    }

    recordAuditEvent({
      tenant_id: req.tenant_id,
      user_id: req.session.user_id,
      entity_type: "putaway_task",
      entity_id: req.params.taskId,
      action: "recompute_bin",
      message: "Suggested bin recomputed",
    });

    return res.json({
      success: true,
      message: "Suggested bin recomputed successfully",
      task: toDetailItem(result.data),
    });
  },
);

router.post(
  "/:taskId/mark-exception",
  writeRateLimit,
  [
    param("taskId").matches(/^PUT\d{6}$/).withMessage("taskId format is invalid"),
    body("reason").trim().isLength({ min: 5 }).withMessage("reason is required and must be at least 5 characters"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canMarkPutawayException(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to mark putaway exceptions" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const result = markPutawayTaskException({
      tenantId: req.tenant_id,
      taskId: req.params.taskId,
      reason: req.body.reason,
      actorUserId: req.session.user_id,
      warehouseId: warehouseScope,
    });

    if (result.error) {
      return res.status(result.error === "Task not found" ? 404 : 400).json({ message: result.error });
    }

    recordAuditEvent({
      tenant_id: req.tenant_id,
      user_id: req.session.user_id,
      entity_type: "putaway_task",
      entity_id: req.params.taskId,
      action: "mark_exception",
      message: "Task marked as exception",
    });

    return res.json({
      success: true,
      message: "Task marked as exception",
      task: toDetailItem(result.data),
    });
  },
);

router.get(
  "/:taskId/history",
  [
    param("taskId").matches(/^PUT\d{6}$/).withMessage("taskId format is invalid"),
    handleValidationResult,
  ],
  (req, res) => {
    if (!canViewPutawayHistory(req.session.role_id)) {
      return res.status(403).json({ message: "You do not have permission to view putaway history" });
    }

    const warehouseScope = resolveWarehouseScope(req.session.role_id, req.session.warehouse_id);
    const item = getPutawayTask(req.tenant_id, req.params.taskId, warehouseScope);
    if (!item) {
      return res.status(404).json({ message: "Putaway task not found" });
    }

    const events = listPutawayTaskEvents(req.tenant_id, req.params.taskId, warehouseScope);
    return res.json(
      events.map((event) => ({
        event_id: event.event_id,
        task_id: event.task_id,
        event_type: event.event_type,
        event_payload: event.event_payload,
        created_by: event.created_by,
        created_at: event.created_at,
      })),
    );
  },
);

export default router;
