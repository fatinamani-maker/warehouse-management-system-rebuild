import { sendSuccess } from "../utils/response.js";

function sendListResponse(res, req, result) {
  return sendSuccess(res, req, result.items, 200, {
    pagination: result.pagination,
  });
}

export { sendListResponse };
