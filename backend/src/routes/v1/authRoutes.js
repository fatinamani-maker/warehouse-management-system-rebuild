import express from "express";
import * as authController from "../../controllers/authController.js";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  getLovSchema,
  listSchema,
  createUserSchema,
  updateUserSchema,
  idOnlySchema,
  createRoleSchema,
  updateRoleSchema,
  createPermissionSchema,
  updatePermissionSchema,
} from "../../validators/authValidators.js";

const router = express.Router();

router.get("/me", authController.getMe);
router.get("/lov/:type", validate(getLovSchema), authController.getLov);

router.get("/users", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(listSchema), authController.listUsers);
router.get("/users/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), validate(idOnlySchema), authController.getUser);
router.post("/users", requireRole(["superadmin", "hqadmin"]), validate(createUserSchema), authController.createUser);
router.put("/users/:id", requireRole(["superadmin", "hqadmin"]), validate(updateUserSchema), authController.updateUser);
router.delete("/users/:id", requireRole(["superadmin", "hqadmin"]), validate(idOnlySchema), authController.deleteUser);

router.get("/roles", requireRole(["superadmin", "hqadmin"]), validate(listSchema), authController.listRoles);
router.get("/roles/:id", requireRole(["superadmin", "hqadmin"]), validate(idOnlySchema), authController.getRole);
router.post("/roles", requireRole(["superadmin"]), validate(createRoleSchema), authController.createRole);
router.put("/roles/:id", requireRole(["superadmin"]), validate(updateRoleSchema), authController.updateRole);
router.delete("/roles/:id", requireRole(["superadmin"]), validate(idOnlySchema), authController.deleteRole);

router.get("/permissions", requireRole(["superadmin", "hqadmin"]), validate(listSchema), authController.listPermissions);
router.get("/permissions/:id", requireRole(["superadmin", "hqadmin"]), validate(idOnlySchema), authController.getPermission);
router.post("/permissions", requireRole(["superadmin"]), validate(createPermissionSchema), authController.createPermission);
router.put("/permissions/:id", requireRole(["superadmin"]), validate(updatePermissionSchema), authController.updatePermission);
router.delete("/permissions/:id", requireRole(["superadmin"]), validate(idOnlySchema), authController.deletePermission);

export default router;
