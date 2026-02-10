import * as authService from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { sendListResponse } from "./helpers.js";

function getMe(req, res) {
  const data = authService.getMe(req.context);
  return sendSuccess(res, req, data);
}

function getLov(req, res) {
  const data = authService.getLov(req.context, req.params.type);
  return sendSuccess(res, req, data);
}

function listUsers(req, res) {
  const result = authService.listUsers(req.context, parsePagination(req.query));
  return sendListResponse(res, req, result);
}

function getUser(req, res) {
  const data = authService.getUser(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function createUser(req, res) {
  const data = authService.createUser(req.context, req.body);
  return sendSuccess(res, req, data, 201);
}

function updateUser(req, res) {
  const data = authService.updateUser(req.context, req.params.id, req.body);
  return sendSuccess(res, req, data);
}

function deleteUser(req, res) {
  const data = authService.deleteUser(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function listRoles(req, res) {
  const result = authService.listRoles(req.context, parsePagination(req.query));
  return sendListResponse(res, req, result);
}

function getRole(req, res) {
  const data = authService.getRole(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function createRole(req, res) {
  const data = authService.createRole(req.context, req.body);
  return sendSuccess(res, req, data, 201);
}

function updateRole(req, res) {
  const data = authService.updateRole(req.context, req.params.id, req.body);
  return sendSuccess(res, req, data);
}

function deleteRole(req, res) {
  const data = authService.deleteRole(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function listPermissions(req, res) {
  const result = authService.listPermissions(req.context, parsePagination(req.query));
  return sendListResponse(res, req, result);
}

function getPermission(req, res) {
  const data = authService.getPermission(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function createPermission(req, res) {
  const data = authService.createPermission(req.context, req.body);
  return sendSuccess(res, req, data, 201);
}

function updatePermission(req, res) {
  const data = authService.updatePermission(req.context, req.params.id, req.body);
  return sendSuccess(res, req, data);
}

function deletePermission(req, res) {
  const data = authService.deletePermission(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

export {
  getMe,
  getLov,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
};
