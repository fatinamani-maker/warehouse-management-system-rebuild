import { nowIso } from "../utils/mock.js";

function buildTimeline(tenantId, key, value, method) {
  return {
    tenantId,
    traceType: key,
    traceValue: value,
    method,
    timelineEvents: [
      {
        eventId: "TRC000001",
        tenantId,
        status: "RECEIVED",
        eventType: "INBOUND",
        location: "Dock-01",
        timestamp: nowIso(),
      },
      {
        eventId: "TRC000002",
        tenantId,
        status: "PUTAWAY_PENDING",
        eventType: "PUTAWAY",
        location: "A-01-01",
        timestamp: nowIso(),
      },
      {
        eventId: "TRC000003",
        tenantId,
        status: "COMPLETED",
        eventType: "PICKING",
        location: "Outbound-01",
        timestamp: nowIso(),
      },
    ],
  };
}

function traceBySku(context, sku) {
  return buildTimeline(context.tenantId, "sku", sku, "SKU_LOOKUP");
}

function traceByQr(context, code) {
  return buildTimeline(context.tenantId, "qr", code, "QR_LOOKUP");
}

function traceByRfid(context, tag) {
  return buildTimeline(context.tenantId, "rfid", tag, "RFID_LOOKUP");
}

export { traceBySku, traceByQr, traceByRfid };
