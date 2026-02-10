import {
  idParamSchema,
  paginationQuerySchema,
  crudCreateBodySchema,
  crudUpdateBodySchema,
} from "./common.js";

const listSchema = { query: paginationQuerySchema };
const createSchema = { body: crudCreateBodySchema };
const updateSchema = { params: idParamSchema, body: crudUpdateBodySchema };
const idSchema = { params: idParamSchema };

export { listSchema, createSchema, updateSchema, idSchema };
