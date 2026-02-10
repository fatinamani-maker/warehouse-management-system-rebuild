import { buildList, buildEntity, buildCreate, buildUpdate, buildDelete } from "./sharedService.js";
import { nowIso } from "../utils/mock.js";

function listRma(context, { page, pageSize }) {
  return buildList("rma", "RMA", context.tenantId, page, pageSize, {
    status: "DRAFT",
  });
}

function getRma(context, id) {
  return buildEntity("rma", "RMA", id, context.tenantId, {
    status: "DRAFT",
  });
}

function createRma(context, payload) {
  return buildCreate("rma", "RMA", context.tenantId, payload, {
    status: "DRAFT",
  });
}

function updateRma(context, id, payload) {
  return buildUpdate("rma", "RMA", id, context.tenantId, payload, {
    status: "REVIEW",
  });
}

function deleteRma(context, id) {
  return buildDelete("rma", id, context.tenantId);
}

function cancelRma(context, id, reason) {
  return {
    ...buildEntity("rma", "RMA", id, context.tenantId, {
      status: "CANCELLED",
    }),
    cancellation: {
      recorded: true,
      confirmationRequired: true,
      reason,
      cancelledBy: context.userId,
      cancelledAt: nowIso(),
    },
  };
}

function progressRma(context, id, payload) {
  return {
    ...buildEntity("rma", "RMA", id, context.tenantId, {
      status: payload.status || "REVIEW",
    }),
    action: payload.action || "PROGRESS",
    progressedBy: context.userId,
    progressedAt: nowIso(),
  };
}

export {
  listRma,
  getRma,
  createRma,
  updateRma,
  deleteRma,
  cancelRma,
  progressRma,
};
