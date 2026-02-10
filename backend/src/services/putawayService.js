import { buildList, buildEntity } from "./sharedService.js";
import { nowIso } from "../utils/mock.js";

function listTasks(context, { page, pageSize, status, assignee }) {
  return buildList("putawayTasks", "PUT", context.tenantId, page, pageSize, {
    status: status || "PUTAWAY_PENDING",
    assignee: assignee || context.userId,
    taskType: "PUTAWAY",
  });
}

function startTask(context, id) {
  return {
    ...buildEntity("putawayTasks", "PUT", id, context.tenantId, {
      status: "STARTED",
    }),
    startedBy: context.userId,
    startedAt: nowIso(),
  };
}

function processScan(context, payload) {
  return {
    tenantId: context.tenantId,
    taskId: payload.taskId,
    barcode: payload.barcode,
    rfid: payload.rfid || null,
    locationCode: payload.locationCode || null,
    status: "PUTAWAY_PENDING",
    scanResult: "ACCEPTED",
    scannedBy: context.userId,
    scannedAt: nowIso(),
  };
}

function completeTask(context, id) {
  return {
    ...buildEntity("putawayTasks", "PUT", id, context.tenantId, {
      status: "COMPLETED",
    }),
    completedBy: context.userId,
    completedAt: nowIso(),
  };
}

export { listTasks, startTask, processScan, completeTask };
