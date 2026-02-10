import * as masterDataService from "../services/masterDataService.js";
import { sendSuccess } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { sendListResponse } from "./helpers.js";

function listFactory(resource) {
  return (req, res) => {
    const result = masterDataService.listResource(req.context, resource, parsePagination(req.query));
    return sendListResponse(res, req, result);
  };
}

function getFactory(resource) {
  return (req, res) => {
    const data = masterDataService.getResource(req.context, resource, req.params.id);
    return sendSuccess(res, req, data);
  };
}

function createFactory(resource) {
  return (req, res) => {
    const data = masterDataService.createResource(req.context, resource, req.body);
    return sendSuccess(res, req, data, 201);
  };
}

function updateFactory(resource) {
  return (req, res) => {
    const data = masterDataService.updateResource(req.context, resource, req.params.id, req.body);
    return sendSuccess(res, req, data);
  };
}

function deleteFactory(resource) {
  return (req, res) => {
    const data = masterDataService.deleteResource(req.context, resource, req.params.id);
    return sendSuccess(res, req, data);
  };
}

export { listFactory, getFactory, createFactory, updateFactory, deleteFactory };
