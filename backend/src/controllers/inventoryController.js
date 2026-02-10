import * as inventoryService from "../services/inventoryService.js";
import { sendSuccess } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { sendListResponse } from "./helpers.js";

function getSummary(req, res) {
  const result = inventoryService.getSummary(req.context, parsePagination(req.query));
  return sendListResponse(res, req, result);
}

function getStock(req, res) {
  const result = inventoryService.getStock(req.context, {
    ...parsePagination(req.query),
    sku: req.query.sku,
    location: req.query.location,
  });
  return sendListResponse(res, req, result);
}

function createAdjustment(req, res) {
  const data = inventoryService.createAdjustment(req.context, req.body);
  return sendSuccess(res, req, data, 201);
}

function listCycleCounts(req, res) {
  const result = inventoryService.listCycleCounts(req.context, parsePagination(req.query));
  return sendListResponse(res, req, result);
}

function getCycleCount(req, res) {
  const data = inventoryService.getCycleCount(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function createCycleCount(req, res) {
  const data = inventoryService.createCycleCount(req.context, req.body);
  return sendSuccess(res, req, data, 201);
}

function updateCycleCount(req, res) {
  const data = inventoryService.updateCycleCount(req.context, req.params.id, req.body);
  return sendSuccess(res, req, data);
}

function deleteCycleCount(req, res) {
  const data = inventoryService.deleteCycleCount(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function startCycleCount(req, res) {
  const data = inventoryService.startCycleCount(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function scanCycleCount(req, res) {
  const data = inventoryService.scanCycleCount(req.context, req.body);
  return sendSuccess(res, req, data);
}

function completeCycleCount(req, res) {
  const data = inventoryService.completeCycleCount(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

export {
  getSummary,
  getStock,
  createAdjustment,
  listCycleCounts,
  getCycleCount,
  createCycleCount,
  updateCycleCount,
  deleteCycleCount,
  startCycleCount,
  scanCycleCount,
  completeCycleCount,
};
