import express from "express";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  listSchema,
  createSchema,
  updateSchema,
  idSchema,
  cancelSchema,
  progressSchema,
} from "../../validators/rmaValidators.js";
import {
  listRma,
  getRma,
  createRma,
  updateRma,
  deleteRma,
  cancelRma,
  progressRma,
} from "../../controllers/rmaController.js";

const router = express.Router();

router.get("/rma", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(listSchema), listRma);
router.get("/rma/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), getRma);
router.post("/rma", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(createSchema), createRma);
router.put("/rma/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(updateSchema), updateRma);
router.delete("/rma/:id", requireRole(["superadmin", "hqadmin"]), validate(idSchema), deleteRma);
router.post("/rma/:id/cancel", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(cancelSchema), cancelRma);
router.post("/rma/:id/progress", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(progressSchema), progressRma);

export default router;
