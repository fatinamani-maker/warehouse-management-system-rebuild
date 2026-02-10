import { buildList, buildEntity, buildCreate, buildUpdate, buildDelete } from "./sharedService.js";
import { nowIso } from "../utils/mock.js";

function getSummary(context, { page, pageSize }) {
  return buildList("inventorySummary", "INV", context.tenantId, page, pageSize, {
    status: "AVAILABLE",
    sku: "SKU000001",
    location: "LOC000001",
    onHandQty: 100,
  });
}

function getStock(context, { page, pageSize, sku, location }) {
  return buildList("inventoryStock", "STK", context.tenantId, page, pageSize, {
    status: "AVAILABLE",
    sku: sku || "SKU000001",
    location: location || "LOC000001",
    onHandQty: 100,
    reservedQty: 10,
  });
}

function createAdjustment(context, payload) {
  return buildCreate("inventoryAdjustment", "ADJ", context.tenantId, payload, {
    status: "COMPLETED",
    adjustedBy: context.userId,
    adjustedAt: nowIso(),
  });
}

function listCycleCounts(context, { page, pageSize }) {
  return buildList("cycleCounts", "CCN", context.tenantId, page, pageSize, {
    status: "DRAFT",
  });
}

function getCycleCount(context, id) {
  return buildEntity("cycleCounts", "CCN", id, context.tenantId, {
    status: "DRAFT",
  });
}

function createCycleCount(context, payload) {
  return buildCreate("cycleCounts", "CCN", context.tenantId, payload, {
    status: "DRAFT",
  });
}

function updateCycleCount(context, id, payload) {
  return buildUpdate("cycleCounts", "CCN", id, context.tenantId, payload, {
    status: "STARTED",
  });
}

function deleteCycleCount(context, id) {
  return buildDelete("cycleCounts", id, context.tenantId);
}

function startCycleCount(context, id) {
  return {
    ...buildEntity("cycleCounts", "CCN", id, context.tenantId, {
      status: "STARTED",
    }),
    startedBy: context.userId,
    startedAt: nowIso(),
  };
}

function scanCycleCount(context, payload) {
  return {
    tenantId: context.tenantId,
    countId: payload.countId,
    sku: payload.sku,
    location: payload.location,
    qty: payload.qty,
    barcode: payload.barcode || null,
    rfid: payload.rfid || null,
    status: "COUNTED",
    scannedBy: context.userId,
    scannedAt: nowIso(),
  };
}

function completeCycleCount(context, id) {
  return {
    ...buildEntity("cycleCounts", "CCN", id, context.tenantId, {
      status: "COMPLETED",
    }),
    completedBy: context.userId,
    completedAt: nowIso(),
  };
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
