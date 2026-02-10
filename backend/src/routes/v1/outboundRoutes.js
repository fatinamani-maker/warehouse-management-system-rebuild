import express from "express";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  listSchema,
  createOrderSchema,
  updateOrderSchema,
  idSchema,
  listPickingTasksSchema,
  pickingScanSchema,
  shippingConfirmSchema,
} from "../../validators/outboundValidators.js";
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  listPickingTasks,
  startPickingTask,
  processPickingScan,
  completePickingTask,
  confirmShipping,
} from "../../controllers/outboundController.js";

const router = express.Router();

router.get("/orders", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(listSchema), listOrders);
router.get("/orders/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), getOrder);
router.post("/orders", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(createOrderSchema), createOrder);
router.put("/orders/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(updateOrderSchema), updateOrder);
router.delete("/orders/:id", requireRole(["superadmin", "hqadmin"]), validate(idSchema), deleteOrder);

router.get("/picking/tasks", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(listPickingTasksSchema), listPickingTasks);
router.post("/picking/tasks/:id/start", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), startPickingTask);
router.post("/picking/scan", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(pickingScanSchema), processPickingScan);
router.post("/picking/tasks/:id/complete", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), completePickingTask);
router.post("/shipping/confirm", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(shippingConfirmSchema), confirmShipping);

export default router;
