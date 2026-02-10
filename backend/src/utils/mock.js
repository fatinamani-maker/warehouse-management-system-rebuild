const statusEnums = {
  inbound: ["DRAFT", "IN_TRANSIT", "RECEIVED", "CANCELLED"],
  putaway: ["ASSIGNED", "STARTED", "PUTAWAY_PENDING", "COMPLETED", "EXCEPTION"],
  picking: ["READY", "STARTED", "PICKING_PENDING", "COMPLETED"],
  order: ["DRAFT", "ALLOCATED", "PICKING", "SHIPPED", "COMPLETED"],
  inventory: ["AVAILABLE", "RESERVED", "DAMAGED", "QUARANTINED"],
  cycleCount: ["DRAFT", "STARTED", "COUNTED", "COMPLETED"],
  rma: ["DRAFT", "REVIEW", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"],
};

function nowIso() {
  return new Date().toISOString();
}

function defaultActor(context = {}) {
  return {
    userId: context.userId || "usr_stub",
    tenantId: context.tenantId || "tn_stub",
  };
}

export { statusEnums, nowIso, defaultActor };
