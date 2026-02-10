import { z, idParamSchema, paginationQuerySchema, crudCreateBodySchema, crudUpdateBodySchema } from "./common.js";

const listSchema = { query: paginationQuerySchema };
const createOrderSchema = { body: crudCreateBodySchema };
const updateOrderSchema = { params: idParamSchema, body: crudUpdateBodySchema };
const idSchema = { params: idParamSchema };

const listPickingTasksSchema = {
  query: paginationQuerySchema.extend({
    status: z.string().trim().optional(),
    assignee: z.string().trim().optional(),
  }),
};

const pickingScanSchema = {
  body: z.object({
    taskId: z.string().trim().min(1),
    sku: z.string().trim().min(1),
    qty: z.coerce.number().positive(),
    barcode: z.string().trim().optional(),
    rfid: z.string().trim().optional(),
  }),
};

const shippingConfirmSchema = {
  body: z.object({
    shipmentId: z.string().trim().optional(),
    orderId: z.string().trim().optional(),
    carrier: z.string().trim().optional(),
    trackingNo: z.string().trim().optional(),
  }).refine((value) => Boolean(value.shipmentId || value.orderId), {
    message: "shipmentId or orderId is required",
  }),
};

export {
  listSchema,
  createOrderSchema,
  updateOrderSchema,
  idSchema,
  listPickingTasksSchema,
  pickingScanSchema,
  shippingConfirmSchema,
};
