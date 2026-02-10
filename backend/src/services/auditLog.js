import { addAuditLog, addTraceEvent } from "../data/store.js";

function recordStatusTransitionAudit({
  tenant_id,
  user_id,
  entity_type,
  entity_id,
  from_status,
  to_status,
  action,
  source = null,
}) {
  const timestamp = new Date().toISOString();

  const auditEntry = addAuditLog({
    tenant_id,
    user_id,
    entity_type,
    entity_id,
    from_status,
    to_status,
    action,
    timestamp,
    source: source ? String(source).toUpperCase() : null,
  });

  addTraceEvent({
    tenant_id,
    event_type: "status_change",
    entity_type,
    entity_id,
    from_status,
    to_status,
    action,
    message: `${entity_type.toUpperCase()} ${entity_id} changed from ${from_status} to ${to_status}`,
    timestamp,
    user_id,
    source: source ? String(source).toUpperCase() : null,
  });

  return auditEntry;
}

function recordAuditEvent({
  tenant_id,
  user_id,
  entity_type,
  entity_id,
  action,
  message,
  source = null,
  includeTraceEvent = false,
}) {
  const timestamp = new Date().toISOString();
  const auditEntry = addAuditLog({
    tenant_id,
    user_id,
    entity_type,
    entity_id,
    from_status: null,
    to_status: null,
    action,
    timestamp,
    message: message || null,
    source: source ? String(source).toUpperCase() : null,
  });

  if (includeTraceEvent) {
    addTraceEvent({
      tenant_id,
      event_type: "audit_event",
      entity_type,
      entity_id,
      from_status: null,
      to_status: null,
      action,
      message: message || `${entity_type.toUpperCase()} ${entity_id} ${action}`,
      timestamp,
      user_id,
      source: source ? String(source).toUpperCase() : null,
    });
  }

  return auditEntry;
}

export { recordAuditEvent, recordStatusTransitionAudit };
