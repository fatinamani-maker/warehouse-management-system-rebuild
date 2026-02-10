import express from "express";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  summarySchema,
  stockSchema,
  adjustmentsSchema,
  listCycleCountsSchema,
  createCycleCountSchema,
  updateCycleCountSchema,
  idSchema,
  scanCycleCountSchema,
} from "../../validators/inventoryValidators.js";
import {
  getSummary,
  getStock,
  createAdjustment,
  listCycleCounts,
  getCycleCount,
  createCycleCount,
  updateCycleCount,
  deleteCycleCount,
  startCycleCount,
  scanCycleCount,
  completeCycleCount,
} from "../../controllers/inventoryController.js";

const router = express.Router();

router.get("/inventory/summary", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(summarySchema), getSummary);
router.get("/inventory/stock", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(stockSchema), getStock);
router.post("/inventory/adjustments", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(adjustmentsSchema), createAdjustment);

router.get("/cycle-counts", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(listCycleCountsSchema), listCycleCounts);
router.get("/cycle-counts/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), getCycleCount);
router.post("/cycle-counts", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(createCycleCountSchema), createCycleCount);
router.put("/cycle-counts/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(updateCycleCountSchema), updateCycleCount);
router.delete("/cycle-counts/:id", requireRole(["superadmin", "hqadmin"]), validate(idSchema), deleteCycleCount);
router.post("/cycle-counts/:id/start", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), startCycleCount);
router.post("/cycle-counts/scan", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(scanCycleCountSchema), scanCycleCount);
router.post("/cycle-counts/:id/complete", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), completeCycleCount);

export default router;
