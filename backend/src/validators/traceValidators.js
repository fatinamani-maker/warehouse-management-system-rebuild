import { z } from "./common.js";

const skuParamSchema = {
  params: z.object({ sku: z.string().trim().min(1) }),
};

const qrParamSchema = {
  params: z.object({ code: z.string().trim().min(1) }),
};

const rfidParamSchema = {
  params: z.object({ tag: z.string().trim().min(1) }),
};

export { skuParamSchema, qrParamSchema, rfidParamSchema };
