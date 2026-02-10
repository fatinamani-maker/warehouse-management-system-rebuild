BEGIN;

CREATE SEQUENCE IF NOT EXISTS trace_event_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS trace_events (
  tenant_id TEXT NOT NULL,
  trace_event_id TEXT PRIMARY KEY DEFAULT ('TRC' || LPAD(NEXTVAL('trace_event_seq')::TEXT, 9, '0')),
  event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(48) NOT NULL,
  status VARCHAR(48) NULL,
  warehouse_id TEXT NOT NULL,
  warehouse_name TEXT NULL,
  process VARCHAR(64) NULL,
  location_id TEXT NULL,
  location_code TEXT NULL,
  location_path TEXT NULL,
  actor_type VARCHAR(16) NOT NULL,
  actor_id TEXT NULL,
  actor_name TEXT NULL,
  device_code TEXT NULL,
  system_code TEXT NULL,
  sku_code TEXT NULL,
  epc TEXT NULL,
  ref_type VARCHAR(32) NULL,
  ref_no TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_trace_events_tenant_event_at
  ON trace_events (tenant_id, event_at DESC);

CREATE INDEX IF NOT EXISTS idx_trace_events_tenant_sku_event_at
  ON trace_events (tenant_id, sku_code, event_at DESC);

CREATE INDEX IF NOT EXISTS idx_trace_events_tenant_epc_event_at
  ON trace_events (tenant_id, epc, event_at DESC);

CREATE INDEX IF NOT EXISTS idx_trace_events_tenant_ref_event_at
  ON trace_events (tenant_id, ref_no, event_at DESC);

CREATE INDEX IF NOT EXISTS idx_trace_events_tenant_location_event_at
  ON trace_events (tenant_id, location_code, event_at DESC);

ALTER TABLE trace_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'trace_events'
      AND policyname = 'trace_events_tenant_isolation'
  ) THEN
    CREATE POLICY trace_events_tenant_isolation ON trace_events
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

COMMIT;
