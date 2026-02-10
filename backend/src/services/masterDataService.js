import { buildList, buildEntity, buildCreate, buildUpdate, buildDelete } from "./sharedService.js";

const resourceConfig = {
  suppliers: { prefix: "SUP", defaultStatus: "ACTIVE" },
  products: { prefix: "PRD", defaultStatus: "ACTIVE" },
  warehouses: { prefix: "WHS", defaultStatus: "ACTIVE" },
  locations: { prefix: "LOC", defaultStatus: "ACTIVE" },
};

function getConfig(resource) {
  return resourceConfig[resource];
}

function listResource(context, resource, { page, pageSize }) {
  const config = getConfig(resource);
  return buildList(resource, config.prefix, context.tenantId, page, pageSize, {
    status: config.defaultStatus,
    name: `${resource.slice(0, -1)} mock`,
  });
}

function getResource(context, resource, id) {
  const config = getConfig(resource);
  return buildEntity(resource, config.prefix, id, context.tenantId, {
    status: config.defaultStatus,
    name: `${resource.slice(0, -1)} mock`,
  });
}

function createResource(context, resource, payload) {
  const config = getConfig(resource);
  return buildCreate(resource, config.prefix, context.tenantId, payload, {
    status: config.defaultStatus,
  });
}

function updateResource(context, resource, id, payload) {
  const config = getConfig(resource);
  return buildUpdate(resource, config.prefix, id, context.tenantId, payload, {
    status: config.defaultStatus,
  });
}

function deleteResource(context, resource, id) {
  return buildDelete(resource, id, context.tenantId);
}

export {
  listResource,
  getResource,
  createResource,
  updateResource,
  deleteResource,
};
