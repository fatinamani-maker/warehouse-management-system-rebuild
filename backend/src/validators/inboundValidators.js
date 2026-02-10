import {
  idParamSchema,
  paginationQuerySchema,
  crudCreateBodySchema,
  crudUpdateBodySchema,
  progressBodySchema,
  cancelBodySchema,
} from "./common.js";

const listSchema = { query: paginationQuerySchema };
const createSchema = { body: crudCreateBodySchema };
const updateSchema = { params: idParamSchema, body: crudUpdateBodySchema };
const idSchema = { params: idParamSchema };
const progressSchema = { params: idParamSchema, body: progressBodySchema };
const cancelSchema = { params: idParamSchema, body: cancelBodySchema };

export { listSchema, createSchema, updateSchema, idSchema, progressSchema, cancelSchema };
