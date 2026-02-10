import { buildList, buildEntity, buildCreate, buildUpdate, buildDelete } from "./sharedService.js";
import { nowIso } from "../utils/mock.js";

function listOrders(context, { page, pageSize }) {
  return buildList("orders", "ORD", context.tenantId, page, pageSize, {
    status: "DRAFT",
    orderType: "OUTBOUND",
  });
}

function getOrder(context, id) {
  return buildEntity("orders", "ORD", id, context.tenantId, {
    status: "DRAFT",
    orderType: "OUTBOUND",
  });
}

function createOrder(context, payload) {
  return buildCreate("orders", "ORD", context.tenantId, payload, {
    status: "DRAFT",
    orderType: "OUTBOUND",
  });
}

function updateOrder(context, id, payload) {
  return buildUpdate("orders", "ORD", id, context.tenantId, payload, {
    status: "ALLOCATED",
    orderType: "OUTBOUND",
  });
}

function deleteOrder(context, id) {
  return buildDelete("orders", id, context.tenantId);
}

function listPickingTasks(context, { page, pageSize, status, assignee }) {
  return buildList("pickingTasks", "PCK", context.tenantId, page, pageSize, {
    status: status || "READY",
    assignee: assignee || context.userId,
  });
}

function startPickingTask(context, id) {
  return {
    ...buildEntity("pickingTasks", "PCK", id, context.tenantId, {
      status: "STARTED",
    }),
    startedBy: context.userId,
    startedAt: nowIso(),
  };
}

function processPickingScan(context, payload) {
  return {
    tenantId: context.tenantId,
    taskId: payload.taskId,
    sku: payload.sku,
    qty: payload.qty,
    barcode: payload.barcode || null,
    rfid: payload.rfid || null,
    status: "PICKING_PENDING",
    scanResult: "ACCEPTED",
    scannedBy: context.userId,
    scannedAt: nowIso(),
  };
}

function completePickingTask(context, id) {
  return {
    ...buildEntity("pickingTasks", "PCK", id, context.tenantId, {
      status: "COMPLETED",
    }),
    completedBy: context.userId,
    completedAt: nowIso(),
  };
}

function confirmShipping(context, payload) {
  return {
    tenantId: context.tenantId,
    shippingId: payload.shipmentId || payload.orderId || "SHP000001",
    orderId: payload.orderId || "ORD000001",
    carrier: payload.carrier || "DHL",
    trackingNo: payload.trackingNo || "TRK000001",
    status: "COMPLETED",
    confirmedBy: context.userId,
    confirmedAt: nowIso(),
  };
}

export {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  listPickingTasks,
  startPickingTask,
  processPickingScan,
  completePickingTask,
  confirmShipping,
};
