import * as rmaService from "../services/rmaService.js";
import { sendSuccess } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { sendListResponse } from "./helpers.js";

function listRma(req, res) {
  const result = rmaService.listRma(req.context, parsePagination(req.query));
  return sendListResponse(res, req, result);
}

function getRma(req, res) {
  const data = rmaService.getRma(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function createRma(req, res) {
  const data = rmaService.createRma(req.context, req.body);
  return sendSuccess(res, req, data, 201);
}

function updateRma(req, res) {
  const data = rmaService.updateRma(req.context, req.params.id, req.body);
  return sendSuccess(res, req, data);
}

function deleteRma(req, res) {
  const data = rmaService.deleteRma(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function cancelRma(req, res) {
  const data = rmaService.cancelRma(req.context, req.params.id, req.body.reason);
  return sendSuccess(res, req, data);
}

function progressRma(req, res) {
  const data = rmaService.progressRma(req.context, req.params.id, req.body);
  return sendSuccess(res, req, data);
}

export { listRma, getRma, createRma, updateRma, deleteRma, cancelRma, progressRma };
