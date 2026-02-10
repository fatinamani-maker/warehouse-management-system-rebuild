import express from "express";
import { getRma, listRmaItems, listRmas, updateRma } from "../data/store.js";
import { recordStatusTransitionAudit } from "../services/auditLog.js";
import { canCancelRma, canViewRma } from "../services/rbac.js";

const router = express.Router();

function toRmaRecord(tenantId, row) {
  return {
    ...row,
    items: listRmaItems(tenantId, row.rma_id),
  };
}

router.get("/", (req, res) => {
  if (!canViewRma(req.session.role_id)) {
    return res.status(403).json({ message: "You do not have permission to view RMA records" });
  }

  return res.json(listRmas(req.tenant_id).map((row) => toRmaRecord(req.tenant_id, row)));
});

router.get("/:rmaId", (req, res) => {
  if (!canViewRma(req.session.role_id)) {
    return res.status(403).json({ message: "You do not have permission to view RMA records" });
  }

  const row = getRma(req.tenant_id, req.params.rmaId);
  if (!row) {
    return res.status(404).json({ message: "RMA not found" });
  }

  return res.json(toRmaRecord(req.tenant_id, row));
});

router.patch("/:rmaId/cancel", (req, res) => {
  if (!canCancelRma(req.session.role_id)) {
    return res.status(403).json({ message: "You do not have permission to cancel RMA records" });
  }

  const cancellationReason = String(req.body?.cancellation_reason || "").trim();
  const cancellationReasonCode = req.body?.cancellation_reason_code
    ? String(req.body.cancellation_reason_code).trim()
    : null;

  if (!cancellationReason) {
    return res.status(400).json({ message: "cancellation_reason is required" });
  }

  if (cancellationReason.length < 5) {
    return res.status(400).json({ message: "cancellation_reason must be at least 5 characters" });
  }

  const row = getRma(req.tenant_id, req.params.rmaId);
  if (!row) {
    return res.status(404).json({ message: "RMA not found" });
  }

  if (["cancelled", "closed"].includes(row.status)) {
    return res.status(409).json({ message: `RMA cannot be cancelled from ${row.status} status` });
  }

  const now = new Date().toISOString();
  const updated = updateRma(req.tenant_id, row.rma_id, (current) => ({
    ...current,
    status: "cancelled",
    cancellation_reason_code: cancellationReasonCode,
    cancellation_reason: cancellationReason,
    cancelled_by: req.session.user_id,
    cancelled_at: now,
    updated_at: now,
  }));

  recordStatusTransitionAudit({
    tenant_id: req.tenant_id,
    user_id: req.session.user_id,
    entity_type: "rma",
    entity_id: row.rma_id,
    from_status: row.status,
    to_status: "cancelled",
    action: "cancel",
  });

  return res.json({
    success: true,
    message: "RMA cancelled successfully",
    document: toRmaRecord(req.tenant_id, updated),
  });
});

export default router;
