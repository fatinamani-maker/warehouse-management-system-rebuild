BEGIN;

-- Prefix + sequence IDs (no UUID)
CREATE SEQUENCE IF NOT EXISTS itx_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS cc_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS ccl_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS cce_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS adj_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS inventory_transactions (
  txn_id TEXT PRIMARY KEY DEFAULT ('ITX' || LPAD(NEXTVAL('itx_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  txn_type VARCHAR(32) NOT NULL,
  sku_id TEXT NOT NULL,
  qty NUMERIC(18, 3) NOT NULL,
  uom_id VARCHAR(16) NULL,
  from_location_id TEXT NULL,
  to_location_id TEXT NULL,
  reference_type VARCHAR(32) NOT NULL,
  reference_id TEXT NULL,
  reason_code VARCHAR(64) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(64) NOT NULL
);

ALTER TABLE inventory_transactions
  ADD CONSTRAINT chk_inventory_txn_type
  CHECK (txn_type IN ('RECEIVE', 'PUTAWAY', 'PICK', 'PACK', 'SHIP', 'RETURN', 'ADJUSTMENT', 'CYCLE_COUNT', 'QUARANTINE_MOVE', 'RESERVE', 'UNRESERVE'));

CREATE TABLE IF NOT EXISTS count_plans (
  count_id TEXT PRIMARY KEY DEFAULT ('CC' || LPAD(NEXTVAL('cc_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  zone_id TEXT NOT NULL,
  planned_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(64) NOT NULL,
  submitted_at TIMESTAMPTZ NULL,
  submitted_by VARCHAR(64) NULL,
  approved_at TIMESTAMPTZ NULL,
  approved_by VARCHAR(64) NULL,
  approval_note TEXT NULL,
  cancellation_reason TEXT NULL
);

ALTER TABLE count_plans
  ADD CONSTRAINT chk_count_plans_status
  CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'));

CREATE TABLE IF NOT EXISTS count_plan_lines (
  line_id TEXT PRIMARY KEY DEFAULT ('CCL' || LPAD(NEXTVAL('ccl_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  count_id TEXT NOT NULL REFERENCES count_plans(count_id) ON DELETE CASCADE,
  sku_id TEXT NOT NULL,
  location_id TEXT NULL,
  system_qty NUMERIC(18, 3) NOT NULL,
  counted_qty NUMERIC(18, 3) NULL,
  variance_qty NUMERIC(18, 3) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS count_entries (
  entry_id TEXT PRIMARY KEY DEFAULT ('CCE' || LPAD(NEXTVAL('cce_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  count_id TEXT NOT NULL REFERENCES count_plans(count_id) ON DELETE CASCADE,
  line_id TEXT NULL REFERENCES count_plan_lines(line_id) ON DELETE SET NULL,
  scan_mode VARCHAR(16) NOT NULL,
  scanned_value TEXT NOT NULL,
  qty_counted NUMERIC(18, 3) NOT NULL,
  qty_delta NUMERIC(18, 3) NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scanned_by VARCHAR(64) NOT NULL
);

ALTER TABLE count_entries
  ADD CONSTRAINT chk_count_entries_scan_mode
  CHECK (scan_mode IN ('QR', 'RFID', 'MANUAL'));

CREATE TABLE IF NOT EXISTS adjustment_requests (
  adj_id TEXT PRIMARY KEY DEFAULT ('ADJ' || LPAD(NEXTVAL('adj_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  sku_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  qty_delta NUMERIC(18, 3) NOT NULL,
  reason_code VARCHAR(64) NOT NULL,
  requested_by VARCHAR(64) NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by VARCHAR(64) NULL,
  approved_at TIMESTAMPTZ NULL,
  approval_note TEXT NULL,
  cancellation_reason TEXT NULL
);

ALTER TABLE adjustment_requests
  ADD CONSTRAINT chk_adjustment_requests_status
  CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'));

-- Useful indexes for paginated/filtered listing
CREATE INDEX IF NOT EXISTS idx_inventory_txn_tenant_created ON inventory_transactions (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_txn_tenant_sku ON inventory_transactions (tenant_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_count_plans_tenant_created ON count_plans (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_count_lines_tenant_count ON count_plan_lines (tenant_id, count_id);
CREATE INDEX IF NOT EXISTS idx_count_entries_tenant_count ON count_entries (tenant_id, count_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_adjustment_requests_tenant_requested ON adjustment_requests (tenant_id, requested_at DESC);

-- RLS policies per tenant (app.current_tenant_id session variable)
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE count_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE count_plan_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE count_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory_transactions' AND policyname='inventory_transactions_tenant_isolation'
  ) THEN
    CREATE POLICY inventory_transactions_tenant_isolation ON inventory_transactions
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='count_plans' AND policyname='count_plans_tenant_isolation'
  ) THEN
    CREATE POLICY count_plans_tenant_isolation ON count_plans
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='count_plan_lines' AND policyname='count_plan_lines_tenant_isolation'
  ) THEN
    CREATE POLICY count_plan_lines_tenant_isolation ON count_plan_lines
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='count_entries' AND policyname='count_entries_tenant_isolation'
  ) THEN
    CREATE POLICY count_entries_tenant_isolation ON count_entries
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='adjustment_requests' AND policyname='adjustment_requests_tenant_isolation'
  ) THEN
    CREATE POLICY adjustment_requests_tenant_isolation ON adjustment_requests
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

COMMIT;
