-- WMS PostgreSQL DDL Patch - Align schema to seed file expectations
-- Generated: 2026-02-10T09:26:51Z
-- Purpose: Amend existing tables and create missing tables/columns so that wms_seed_fixed_v2.sql can run cleanly.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '0';

-- -------------------------------------------------------------------
-- returns: add columns used by seed script
-- -------------------------------------------------------------------
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS sku_id text NULL REFERENCES skus(sku_id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS qty numeric(18,4) NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS reason_code text NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS reason_description text NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS notes text NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS updated_at timestamptz NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS cancelled_by text NULL REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS cancellation_reason_code text NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS received_at timestamptz NULL;
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS closed_at timestamptz NULL;

-- -------------------------------------------------------------------
-- inventory_transactions: make compatible with seed column set
-- -------------------------------------------------------------------
ALTER TABLE IF EXISTS inventory_transactions ALTER COLUMN tx_type DROP NOT NULL;
ALTER TABLE IF EXISTS inventory_transactions ADD COLUMN IF NOT EXISTS txn_id text NULL;
ALTER TABLE IF EXISTS inventory_transactions ADD COLUMN IF NOT EXISTS txn_type text NULL;
ALTER TABLE IF EXISTS inventory_transactions ADD COLUMN IF NOT EXISTS uom_id text NULL;
ALTER TABLE IF EXISTS inventory_transactions ADD COLUMN IF NOT EXISTS reference_type text NULL;
ALTER TABLE IF EXISTS inventory_transactions ADD COLUMN IF NOT EXISTS reference_id text NULL;
ALTER TABLE IF EXISTS inventory_transactions ADD COLUMN IF NOT EXISTS reason_code text NULL;
ALTER TABLE IF EXISTS inventory_transactions ADD COLUMN IF NOT EXISTS created_at timestamptz NULL;

-- -------------------------------------------------------------------
-- trace_events: add descriptive columns used by seed script
-- -------------------------------------------------------------------
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS warehouse_name text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS process text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS location_code text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS location_path text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS actor_type text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS actor_id text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS actor_name text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS device_code text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS system_code text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS sku_code text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS epc text NULL;
ALTER TABLE IF EXISTS trace_events ADD COLUMN IF NOT EXISTS ref_no text NULL;

-- -------------------------------------------------------------------
-- Missing tables referenced by seed script
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rma (
  rma_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  return_id text NULL REFERENCES returns(return_id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'created',
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  updated_at timestamptz NULL,
  cancellation_reason text NULL,
  cancellation_reason_code text NULL,
  cancelled_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancelled_at timestamptz NULL,
  closed_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS rma_items (
  rma_item_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  rma_id text NOT NULL REFERENCES rma(rma_id) ON DELETE CASCADE,
  sku_id text NULL REFERENCES skus(sku_id) ON DELETE SET NULL,
  qty numeric(18,4) NOT NULL DEFAULT 0,
  reason_code text NULL
);


-- -------------------------------------------------------------------
-- putaway_tasks: add compatibility column expected by seed (task_id)
-- Seed uses putaway_task_events.task_id referencing putaway_tasks.task_id.
-- Base table uses putaway_task_id as PK. We add a generated alias column.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='putaway_tasks'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='putaway_tasks' AND column_name='task_id'
  ) THEN
    ALTER TABLE putaway_tasks
      ADD COLUMN task_id text GENERATED ALWAYS AS (putaway_task_id) STORED;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_putaway_tasks_task_id ON putaway_tasks(task_id);

CREATE TABLE IF NOT EXISTS putaway_task_events (
  event_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  task_id text NOT NULL REFERENCES putaway_tasks(task_id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_payload jsonb NULL,
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS count_plans (
  count_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  zone_id text NULL,
  planned_date date NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  submitted_at timestamptz NULL,
  submitted_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  approved_at timestamptz NULL,
  approved_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  approval_note text NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS count_plan_lines (
  line_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  count_id text NOT NULL REFERENCES count_plans(count_id) ON DELETE CASCADE,
  sku_id text NULL REFERENCES skus(sku_id) ON DELETE SET NULL,
  location_id text NULL REFERENCES locations(location_id) ON DELETE SET NULL,
  system_qty numeric(18,4) NULL,
  counted_qty numeric(18,4) NULL,
  variance_qty numeric(18,4) NULL,
  status text NULL
);

CREATE TABLE IF NOT EXISTS count_entries (
  entry_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  count_id text NOT NULL REFERENCES count_plans(count_id) ON DELETE CASCADE,
  line_id text NULL REFERENCES count_plan_lines(line_id) ON DELETE SET NULL,
  scan_mode text NULL,
  scanned_value text NULL,
  qty_counted numeric(18,4) NULL,
  qty_delta numeric(18,4) NULL,
  scanned_at timestamptz NULL,
  scanned_by text NULL REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS adjustment_requests (
  adj_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'PENDING',
  sku_id text NULL REFERENCES skus(sku_id) ON DELETE SET NULL,
  location_id text NULL REFERENCES locations(location_id) ON DELETE SET NULL,
  qty_delta numeric(18,4) NOT NULL DEFAULT 0,
  reason_code text NULL,
  requested_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  approved_at timestamptz NULL,
  approval_note text NULL,
  cancellation_reason text NULL
);

COMMIT;