import { buildList, buildEntity, buildCreate, buildUpdate, buildDelete } from "./sharedService.js";
import { nowIso } from "../utils/mock.js";

const configByResource = {
  asn: { prefix: "ASN", status: "DRAFT" },
  grn: { prefix: "GRN", status: "DRAFT" },
};

function listRecords(context, resource, { page, pageSize }) {
  const config = configByResource[resource];
  return buildList(resource, config.prefix, context.tenantId, page, pageSize, {
    status: config.status,
  });
}

function getRecord(context, resource, id) {
  const config = configByResource[resource];
  return buildEntity(resource, config.prefix, id, context.tenantId, {
    status: config.status,
  });
}

function createRecord(context, resource, payload) {
  const config = configByResource[resource];
  return buildCreate(resource, config.prefix, context.tenantId, payload, {
    status: config.status,
  });
}

function updateRecord(context, resource, id, payload) {
  const config = configByResource[resource];
  return buildUpdate(resource, config.prefix, id, context.tenantId, payload, {
    status: config.status,
  });
}

function deleteRecord(context, resource, id) {
  return buildDelete(resource, id, context.tenantId);
}

function progressRecord(context, resource, id, payload) {
  const config = configByResource[resource];
  return {
    ...buildEntity(resource, config.prefix, id, context.tenantId, {
      status: payload.status || "RECEIVED",
    }),
    action: payload.action || "PROGRESS",
    notes: payload.notes || null,
    progressedBy: context.userId,
    progressedAt: nowIso(),
  };
}

function cancelRecord(context, resource, id, reason) {
  const config = configByResource[resource];
  return {
    ...buildEntity(resource, config.prefix, id, context.tenantId, {
      status: "CANCELLED",
    }),
    cancellation: {
      recorded: true,
      confirmationRequired: resource === "asn",
      reason,
      cancelledBy: context.userId,
      cancelledAt: nowIso(),
    },
  };
}

export {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  progressRecord,
  cancelRecord,
};
