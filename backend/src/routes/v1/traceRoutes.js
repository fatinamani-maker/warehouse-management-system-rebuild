import express from "express";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { traceBySku, traceByQr, traceByRfid } from "../../controllers/traceabilityController.js";
import { skuParamSchema, qrParamSchema, rfidParamSchema } from "../../validators/traceValidators.js";

const router = express.Router();

router.get("/trace/sku/:sku", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(skuParamSchema), traceBySku);
router.get("/trace/qr/:code", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(qrParamSchema), traceByQr);
router.get("/trace/rfid/:tag", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(rfidParamSchema), traceByRfid);

export default router;
