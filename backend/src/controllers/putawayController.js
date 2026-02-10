import * as putawayService from "../services/putawayService.js";
import { sendSuccess } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { sendListResponse } from "./helpers.js";

function listTasks(req, res) {
  const result = putawayService.listTasks(req.context, {
    ...parsePagination(req.query),
    status: req.query.status,
    assignee: req.query.assignee,
  });

  return sendListResponse(res, req, result);
}

function startTask(req, res) {
  const data = putawayService.startTask(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

function processScan(req, res) {
  const data = putawayService.processScan(req.context, req.body);
  return sendSuccess(res, req, data);
}

function completeTask(req, res) {
  const data = putawayService.completeTask(req.context, req.params.id);
  return sendSuccess(res, req, data);
}

export { listTasks, startTask, processScan, completeTask };
