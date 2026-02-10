import { generateMockId } from "../utils/idGenerator.js";
import { buildPagination } from "../utils/pagination.js";
import { nowIso } from "../utils/mock.js";

function buildList(resource, prefix, tenantId, page, pageSize, extra = {}) {
  const items = [
    {
      id: generateMockId(prefix),
      tenantId,
      resource,
      status: "DRAFT",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...extra,
    },
  ];

  return {
    items,
    pagination: buildPagination(page, pageSize, items.length),
  };
}

function buildEntity(resource, prefix, id, tenantId, extra = {}) {
  return {
    id: id || generateMockId(prefix),
    tenantId,
    resource,
    status: "DRAFT",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...extra,
  };
}

function buildCreate(resource, prefix, tenantId, payload = {}, extra = {}) {
  return {
    ...buildEntity(resource, prefix, generateMockId(prefix), tenantId, extra),
    ...payload,
    createdAt: nowIso(),
  };
}

function buildUpdate(resource, prefix, id, tenantId, payload = {}, extra = {}) {
  return {
    ...buildEntity(resource, prefix, id, tenantId, extra),
    ...payload,
    updatedAt: nowIso(),
  };
}

function buildDelete(resource, id, tenantId) {
  return {
    id,
    tenantId,
    resource,
    deleted: false,
    deletionRecorded: true,
    timestamp: nowIso(),
  };
}

export { buildList, buildEntity, buildCreate, buildUpdate, buildDelete };
