import express from "express";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  listSchema,
  createSchema,
  updateSchema,
  idSchema,
  progressSchema,
  cancelSchema,
} from "../../validators/inboundValidators.js";
import {
  listFactory,
  getFactory,
  createFactory,
  updateFactory,
  deleteFactory,
  progressFactory,
  cancelFactory,
} from "../../controllers/inboundController.js";

const router = express.Router();

function mountCrud(resourcePath, resourceKey) {
  router.get(`/${resourcePath}`, requireRole(["superadmin", "hqadmin", "storemanager"]), validate(listSchema), listFactory(resourceKey));
  router.get(`/${resourcePath}/:id`, requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idSchema), getFactory(resourceKey));
  router.post(`/${resourcePath}`, requireRole(["superadmin", "hqadmin", "storemanager"]), validate(createSchema), createFactory(resourceKey));
  router.put(`/${resourcePath}/:id`, requireRole(["superadmin", "hqadmin", "storemanager"]), validate(updateSchema), updateFactory(resourceKey));
  router.delete(`/${resourcePath}/:id`, requireRole(["superadmin", "hqadmin"]), validate(idSchema), deleteFactory(resourceKey));
}

mountCrud("asn", "asn");
mountCrud("grn", "grn");

router.post("/asn/:id/progress", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(progressSchema), progressFactory("asn"));
router.post("/grn/:id/progress", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(progressSchema), progressFactory("grn"));
router.post("/asn/:id/cancel", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(cancelSchema), cancelFactory("asn"));
router.post("/grn/:id/cancel", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(cancelSchema), cancelFactory("grn"));

export default router;
