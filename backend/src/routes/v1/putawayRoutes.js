import express from "express";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { listTasksSchema, idSchema, scanSchema } from "../../validators/putawayValidators.js";
import { listTasks, startTask, processScan, completeTask } from "../../controllers/putawayController.js";

const router = express.Router();

router.get("/putaway/tasks", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(listTasksSchema), listTasks);
router.post("/putaway/tasks/:id/start", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), startTask);
router.post("/putaway/scan", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(scanSchema), processScan);
router.post("/putaway/tasks/:id/complete", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), completeTask);

export default router;
