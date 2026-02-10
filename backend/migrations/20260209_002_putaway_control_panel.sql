BEGIN;

-- Putaway task event ID sequence (no UUIDs)
CREATE SEQUENCE IF NOT EXISTS putevt_id_seq START WITH 1 INCREMENT BY 1;

-- Extend putaway_tasks for control panel execution/evidence fields
ALTER TABLE IF EXISTS putaway_tasks
  ADD COLUMN IF NOT EXISTS assigned_to_user_id VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS actual_bin_id VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS actual_bin_code VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS device_type VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS scan_method VARCHAR(16) NULL,
  ADD COLUMN IF NOT EXISTS epc_expected_count INTEGER NULL,
  ADD COLUMN IF NOT EXISTS epc_confirmed_count INTEGER NULL,
  ADD COLUMN IF NOT EXISTS validation_result VARCHAR(16) NULL,
  ADD COLUMN IF NOT EXISTS exception_reason TEXT NULL;

ALTER TABLE IF EXISTS putaway_tasks
  ALTER COLUMN tenant_id SET NOT NULL;

-- Status lifecycle support
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'putaway_tasks'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE putaway_tasks
      DROP CONSTRAINT IF EXISTS chk_putaway_tasks_status;

    ALTER TABLE putaway_tasks
      ADD CONSTRAINT chk_putaway_tasks_status
      CHECK (status IN ('pending', 'in_progress', 'completed', 'exception'));
  END IF;
END $$;

-- Event stream table for timeline/audit UI
CREATE TABLE IF NOT EXISTS putaway_task_events (
  event_id TEXT PRIMARY KEY DEFAULT ('PUTEVT' || LPAD(NEXTVAL('putevt_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  task_id TEXT NOT NULL REFERENCES putaway_tasks(task_id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_putaway_tasks_tenant_id ON putaway_tasks (tenant_id);
CREATE INDEX IF NOT EXISTS idx_putaway_tasks_status ON putaway_tasks (status);
CREATE INDEX IF NOT EXISTS idx_putaway_tasks_priority ON putaway_tasks (priority);
CREATE INDEX IF NOT EXISTS idx_putaway_events_tenant_task ON putaway_task_events (tenant_id, task_id, created_at);

-- Tenant isolation policies (RLS-ready)
ALTER TABLE IF EXISTS putaway_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS putaway_task_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'putaway_tasks' AND policyname = 'putaway_tasks_tenant_isolation'
  ) THEN
    CREATE POLICY putaway_tasks_tenant_isolation ON putaway_tasks
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'putaway_task_events' AND policyname = 'putaway_task_events_tenant_isolation'
  ) THEN
    CREATE POLICY putaway_task_events_tenant_isolation ON putaway_task_events
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

COMMIT;
