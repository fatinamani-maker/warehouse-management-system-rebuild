import * as inboundService from "../services/inboundService.js";
import { sendSuccess } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { sendListResponse } from "./helpers.js";

function listFactory(resource) {
  return (req, res) => {
    const result = inboundService.listRecords(req.context, resource, parsePagination(req.query));
    return sendListResponse(res, req, result);
  };
}

function getFactory(resource) {
  return (req, res) => {
    const data = inboundService.getRecord(req.context, resource, req.params.id);
    return sendSuccess(res, req, data);
  };
}

function createFactory(resource) {
  return (req, res) => {
    const data = inboundService.createRecord(req.context, resource, req.body);
    return sendSuccess(res, req, data, 201);
  };
}

function updateFactory(resource) {
  return (req, res) => {
    const data = inboundService.updateRecord(req.context, resource, req.params.id, req.body);
    return sendSuccess(res, req, data);
  };
}

function deleteFactory(resource) {
  return (req, res) => {
    const data = inboundService.deleteRecord(req.context, resource, req.params.id);
    return sendSuccess(res, req, data);
  };
}

function progressFactory(resource) {
  return (req, res) => {
    const data = inboundService.progressRecord(req.context, resource, req.params.id, req.body);
    return sendSuccess(res, req, data);
  };
}

function cancelFactory(resource) {
  return (req, res) => {
    const data = inboundService.cancelRecord(req.context, resource, req.params.id, req.body.reason);
    return sendSuccess(res, req, data);
  };
}

export {
  listFactory,
  getFactory,
  createFactory,
  updateFactory,
  deleteFactory,
  progressFactory,
  cancelFactory,
};
