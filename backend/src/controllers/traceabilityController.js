import * as traceabilityService from "../services/traceabilityService.js";
import { sendSuccess } from "../utils/response.js";

function traceBySku(req, res) {
  const data = traceabilityService.traceBySku(req.context, req.params.sku);
  return sendSuccess(res, req, data);
}

function traceByQr(req, res) {
  const data = traceabilityService.traceByQr(req.context, req.params.code);
  return sendSuccess(res, req, data);
}

function traceByRfid(req, res) {
  const data = traceabilityService.traceByRfid(req.context, req.params.tag);
  return sendSuccess(res, req, data);
}

export { traceBySku, traceByQr, traceByRfid };
