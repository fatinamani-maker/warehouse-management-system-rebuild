import { z, idParamSchema, paginationQuerySchema } from "./common.js";

const listTasksSchema = {
  query: paginationQuerySchema.extend({
    status: z.string().trim().optional(),
    assignee: z.string().trim().optional(),
  }),
};

const idSchema = {
  params: idParamSchema,
};

const scanSchema = {
  body: z.object({
    taskId: z.string().trim().min(1),
    barcode: z.string().trim().min(1),
    rfid: z.string().trim().optional(),
    locationCode: z.string().trim().optional(),
  }),
};

export { listTasksSchema, idSchema, scanSchema };
