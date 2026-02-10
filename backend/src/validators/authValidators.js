import {
  z,
  idParamSchema,
  typeParamSchema,
  paginationQuerySchema,
  crudCreateBodySchema,
  crudUpdateBodySchema,
} from "./common.js";

const getLovSchema = {
  params: typeParamSchema,
};

const listSchema = {
  query: paginationQuerySchema,
};

const createUserSchema = {
  body: crudCreateBodySchema.extend({
    email: z.string().email(),
    roleId: z.string().trim().min(1).toLowerCase().optional(),
  }),
};

const updateUserSchema = {
  params: idParamSchema,
  body: crudUpdateBodySchema,
};

const idOnlySchema = {
  params: idParamSchema,
};

const createRoleSchema = {
  body: crudCreateBodySchema.extend({
    role_id: z.string().trim().regex(/^[a-z0-9_\-]+$/),
    permissions: z.array(z.string().trim().min(1)).optional(),
  }),
};

const updateRoleSchema = {
  params: idParamSchema,
  body: crudUpdateBodySchema.extend({
    permissions: z.array(z.string().trim().min(1)).optional(),
  }),
};

const createPermissionSchema = {
  body: crudCreateBodySchema.extend({
    permission_id: z.string().trim().min(1),
  }),
};

const updatePermissionSchema = {
  params: idParamSchema,
  body: crudUpdateBodySchema,
};

export {
  getLovSchema,
  listSchema,
  createUserSchema,
  updateUserSchema,
  idOnlySchema,
  createRoleSchema,
  updateRoleSchema,
  createPermissionSchema,
  updatePermissionSchema,
};
