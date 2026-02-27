import express from "express";
import { requireRole } from "../../middlewares/auth.js";

const router = express.Router();

// ==============================
// STUB DATA
// ==============================
const putawayTasks = [
  {
    id: "PT000001",
    sku: "ITEM001",
    fromLocation: "RECEIVING",
    toLocation: "A1",
    status: "CREATED",
    tenantId: "TEN001",
    createdAt: new Date().toISOString()
  }
];

// ==============================
// LIST TASKS
// ==============================
router.get("/putaway/tasks", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: putawayTasks
  });
});

// ==============================
// START TASK
// ==============================
router.post("/putaway/tasks/:id/start", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Putaway task ${req.params.id} started successfully`
  });
});

// ==============================
// PROCESS SCAN
// ==============================
router.post("/putaway/scan", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: "Scan processed successfully",
    data: req.body
  });
});

// ==============================
// COMPLETE TASK
// ==============================
router.post("/putaway/tasks/:id/complete", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Putaway task ${req.params.id} completed successfully`
  });
});

export default router;