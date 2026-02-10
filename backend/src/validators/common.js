import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

const typeParamSchema = z.object({
  type: z.string().trim().min(1),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
});

const progressBodySchema = z.object({
  action: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(500).optional(),
});

const cancelBodySchema = z.object({
  reason: z.string().trim().min(1),
  confirm: z.boolean().optional(),
});

const crudCreateBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.string().trim().min(1).optional(),
}).passthrough();

const crudUpdateBodySchema = crudCreateBodySchema.partial();

export {
  z,
  idParamSchema,
  typeParamSchema,
  paginationQuerySchema,
  progressBodySchema,
  cancelBodySchema,
  crudCreateBodySchema,
  crudUpdateBodySchema,
};
