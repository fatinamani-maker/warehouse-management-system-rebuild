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
const cancelSchema = { params: idParamSchema, body: cancelBodySchema };
const progressSchema = { params: idParamSchema, body: progressBodySchema };

export { listSchema, createSchema, updateSchema, idSchema, cancelSchema, progressSchema };
