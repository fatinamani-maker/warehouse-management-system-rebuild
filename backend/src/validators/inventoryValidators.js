import { z, idParamSchema, paginationQuerySchema, crudCreateBodySchema, crudUpdateBodySchema } from "./common.js";

const summarySchema = {
  query: paginationQuerySchema,
};

const stockSchema = {
  query: paginationQuerySchema.extend({
    sku: z.string().trim().optional(),
    location: z.string().trim().optional(),
  }),
};

const adjustmentsSchema = {
  body: z.object({
    sku: z.string().trim().min(1),
    location: z.string().trim().min(1),
    qty: z.coerce.number(),
    reason: z.string().trim().min(1),
  }),
};

const listCycleCountsSchema = { query: paginationQuerySchema };
const createCycleCountSchema = { body: crudCreateBodySchema };
const updateCycleCountSchema = { params: idParamSchema, body: crudUpdateBodySchema };
const idSchema = { params: idParamSchema };

const scanCycleCountSchema = {
  body: z.object({
    countId: z.string().trim().min(1),
    sku: z.string().trim().min(1),
    location: z.string().trim().min(1),
    qty: z.coerce.number().nonnegative(),
    barcode: z.string().trim().optional(),
    rfid: z.string().trim().optional(),
  }),
};

export {
  summarySchema,
  stockSchema,
  adjustmentsSchema,
  listCycleCountsSchema,
  createCycleCountSchema,
  updateCycleCountSchema,
  idSchema,
  scanCycleCountSchema,
};
