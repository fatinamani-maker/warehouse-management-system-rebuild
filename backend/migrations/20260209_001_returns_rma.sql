BEGIN;

-- Prefix + padded sequence IDs (no UUIDs)
CREATE SEQUENCE IF NOT EXISTS rtn_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS rma_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS rmi_id_seq START WITH 1 INCREMENT BY 1;

-- Returns table amendments
ALTER TABLE IF EXISTS returns
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS cancellation_reason_code VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL;

ALTER TABLE IF EXISTS returns
  ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE IF EXISTS returns
  ALTER COLUMN return_id TYPE TEXT USING return_id::TEXT;

ALTER TABLE IF EXISTS returns
  ALTER COLUMN return_id SET DEFAULT ('RTN' || LPAD(NEXTVAL('rtn_id_seq')::TEXT, 6, '0'));

-- RMA header table
CREATE TABLE IF NOT EXISTS rma (
  rma_id TEXT PRIMARY KEY DEFAULT ('RMA' || LPAD(NEXTVAL('rma_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  return_id TEXT NOT NULL REFERENCES returns(return_id),
  status VARCHAR(32) NOT NULL DEFAULT 'created',
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(64) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancellation_reason TEXT NULL,
  cancellation_reason_code VARCHAR(64) NULL,
  cancelled_by VARCHAR(64) NULL,
  cancelled_at TIMESTAMPTZ NULL,
  closed_at TIMESTAMPTZ NULL
);

-- RMA line table
CREATE TABLE IF NOT EXISTS rma_items (
  rma_item_id TEXT PRIMARY KEY DEFAULT ('RMI' || LPAD(NEXTVAL('rmi_id_seq')::TEXT, 6, '0')),
  tenant_id TEXT NOT NULL,
  rma_id TEXT NOT NULL REFERENCES rma(rma_id) ON DELETE CASCADE,
  sku_id TEXT NOT NULL,
  qty NUMERIC(18, 3) NOT NULL CHECK (qty > 0),
  reason_code VARCHAR(64) NULL
);

CREATE INDEX IF NOT EXISTS idx_returns_tenant_id ON returns (tenant_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns (status);
CREATE INDEX IF NOT EXISTS idx_rma_tenant_id ON rma (tenant_id);
CREATE INDEX IF NOT EXISTS idx_rma_return_id ON rma (return_id);
CREATE INDEX IF NOT EXISTS idx_rma_items_tenant_id ON rma_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_rma_items_rma_id ON rma_items (rma_id);

-- RLS, tenant isolation via app.current_tenant_id
ALTER TABLE IF EXISTS returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rma ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rma_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'returns' AND policyname = 'returns_tenant_isolation'
  ) THEN
    CREATE POLICY returns_tenant_isolation ON returns
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'rma' AND policyname = 'rma_tenant_isolation'
  ) THEN
    CREATE POLICY rma_tenant_isolation ON rma
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'rma_items' AND policyname = 'rma_items_tenant_isolation'
  ) THEN
    CREATE POLICY rma_items_tenant_isolation ON rma_items
      USING (tenant_id = current_setting('app.current_tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
  END IF;
END $$;

COMMIT;
