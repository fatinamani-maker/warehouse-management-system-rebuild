-- Warehouse Management System (WMS) - PostgreSQL DDL
-- Generated: 2026-02-10 (Asia/Kuala_Lumpur)
-- Notes:
-- 1) Multi-tenancy + RLS: all tenant-scoped tables include tenant_id and have RLS enabled.
-- 2) IDs: No UUID primary keys for master tables. Uses PREFIX + LPAD(sequence).
-- 3) Frontend never connects directly to DB; API sets `app.tenant_id` (and optionally app.user_id, app.role_id, app.warehouse_id)
--    per request/connection using JWT context.
-- 4) Clerk handles authentication; `users` stores profile + tenancy/warehouse assignment.
-- =====================================================================================
-- Schema + Extensions
-- =====================================================================================
-- Target schema: public

-- Useful extensions (safe defaults)
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- for cryptographic functions if needed
CREATE EXTENSION IF NOT EXISTS citext;    -- case-insensitive emails/usernames

SET search_path = public;

-- =====================================================================================
-- Helper: session context (set by API)
-- =====================================================================================
-- API should set these at request start:
--   SELECT set_config('app.tenant_id', 'TENANT_ID', true);
--   SELECT set_config('app.user_id',   'USER_ID',   true);
--   SELECT set_config('app.role_id',   'ROLE_ID',   true);
--   SELECT set_config('app.warehouse_id','WAREHOUSE_ID', true);

-- Helper functions to read per-request session settings (set by API via set_config)
-- Using classic syntax order for maximum compatibility across clients.
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS text
AS $fn$
  SELECT current_setting('app.tenant_id', true);
$fn$
LANGUAGE sql
STABLE;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS text
AS $fn$
  SELECT current_setting('app.user_id', true);
$fn$
LANGUAGE sql
STABLE;

CREATE OR REPLACE FUNCTION current_warehouse_id()
RETURNS text
AS $fn$
  SELECT current_setting('app.warehouse_id', true);
$fn$
LANGUAGE sql
STABLE;
-- =====================================================================================
-- Sequences (prefix + padded)
-- =====================================================================================
-- Core masters
CREATE SEQUENCE IF NOT EXISTS tenant_id_seq   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS warehouse_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS location_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS sku_id_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS supplier_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS customer_id_seq START WITH 1 INCREMENT BY 1;

-- Users / audit
CREATE SEQUENCE IF NOT EXISTS user_id_seq     START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS audit_id_seq    START WITH 1 INCREMENT BY 1;

-- Inbound
CREATE SEQUENCE IF NOT EXISTS asn_id_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS asn_line_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS grn_id_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS grn_line_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS putaway_task_id_seq START WITH 1 INCREMENT BY 1;

-- Inventory
CREATE SEQUENCE IF NOT EXISTS inv_balance_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS itx_id_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS cc_id_seq       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS ccl_id_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS adj_id_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS adj_line_id_seq START WITH 1 INCREMENT BY 1;

-- Outbound
CREATE SEQUENCE IF NOT EXISTS so_id_seq       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS so_line_id_seq  START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS wave_id_seq     START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS pick_task_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS pack_task_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS shipment_id_seq START WITH 1 INCREMENT BY 1;

-- Returns
CREATE SEQUENCE IF NOT EXISTS return_id_seq   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS rma_id_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS rmi_id_seq      START WITH 1 INCREMENT BY 1;

-- Trace
CREATE SEQUENCE IF NOT EXISTS trace_event_seq START WITH 1 INCREMENT BY 1;

-- LOV
CREATE SEQUENCE IF NOT EXISTS lov_group_seq   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS lov_value_seq   START WITH 1 INCREMENT BY 1;

-- =====================================================================================
-- Enumerated values (as CHECK constraints for portability)
-- =====================================================================================
-- Status check helpers are applied per table.

-- =====================================================================================
-- Tenancy
-- =====================================================================================
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id  text PRIMARY KEY DEFAULT ('TNT' || LPAD(NEXTVAL('tenant_id_seq')::text, 6, '0')),
  tenant_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouses (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  warehouse_id text PRIMARY KEY DEFAULT ('WH' || LPAD(NEXTVAL('warehouse_id_seq')::text, 6, '0')),
  warehouse_name text NOT NULL,
  city text NULL,
  country text NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, warehouse_name)
);

-- Locations / bins
CREATE TABLE IF NOT EXISTS locations (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  location_id text PRIMARY KEY DEFAULT ('LOC' || LPAD(NEXTVAL('location_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  zone text NULL,
  aisle text NULL,
  rack text NULL,
  bin text NULL,
  label text NOT NULL,
  location_type text NOT NULL DEFAULT 'storage'
    CHECK (location_type IN ('storage','dock','staging','quarantine','packing','shipping','receiving')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, warehouse_id, label)
);

-- =====================================================================================
-- RBAC / Users (Clerk-integrated)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS roles (
  role_id text PRIMARY KEY,          -- must be lowercase (enforced by CHECK)
  role_name text NOT NULL,
  description text NULL,
  is_system boolean NOT NULL DEFAULT false,
  CHECK (role_id = lower(role_id))
);

CREATE TABLE IF NOT EXISTS permissions (
  permission_id text PRIMARY KEY,
  permission_name text NOT NULL,
  description text NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id text NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id text NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  user_id text PRIMARY KEY DEFAULT ('USR' || LPAD(NEXTVAL('user_id_seq')::text, 6, '0')),
  clerk_user_id text UNIQUE NULL,      -- preferred primary identity
  email citext UNIQUE NULL,
  user_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id text NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_warehouses (
  user_id text NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, warehouse_id)
);

-- =====================================================================================
-- LOV Maintenance
-- =====================================================================================
CREATE TABLE IF NOT EXISTS lov_groups (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  lov_group_id text PRIMARY KEY DEFAULT ('LVG' || LPAD(NEXTVAL('lov_group_seq')::text, 6, '0')),
  group_code text NOT NULL,
  group_name text NOT NULL,
  description text NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, group_code)
);

CREATE TABLE IF NOT EXISTS lov_values (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  lov_value_id text PRIMARY KEY DEFAULT ('LVV' || LPAD(NEXTVAL('lov_value_seq')::text, 6, '0')),
  lov_group_id text NOT NULL REFERENCES lov_groups(lov_group_id) ON DELETE CASCADE,
  value_code text NOT NULL,
  value_label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, lov_group_id, value_code)
);

-- =====================================================================================
-- Master Data
-- =====================================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  supplier_id text PRIMARY KEY DEFAULT ('SUP' || LPAD(NEXTVAL('supplier_id_seq')::text, 6, '0')),
  supplier_name text NOT NULL,
  supplier_code text NULL,
  email citext NULL,
  phone text NULL,
  address text NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, supplier_name)
);

CREATE TABLE IF NOT EXISTS customers (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  customer_id text PRIMARY KEY DEFAULT ('CUS' || LPAD(NEXTVAL('customer_id_seq')::text, 6, '0')),
  customer_name text NOT NULL,
  customer_code text NULL,
  email citext NULL,
  phone text NULL,
  address text NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, customer_name)
);

CREATE TABLE IF NOT EXISTS skus (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  sku_id text PRIMARY KEY DEFAULT ('SKU' || LPAD(NEXTVAL('sku_id_seq')::text, 6, '0')),
  sku_code text NULL, -- optional external code
  description text NOT NULL,
  uom text NOT NULL DEFAULT 'EA',
  category text NULL,
  hazardous boolean NOT NULL DEFAULT false,
  weight numeric(12,4) NULL,
  dimensions text NULL,
  reorder_point numeric(18,4) NOT NULL DEFAULT 0,
  reorder_qty numeric(18,4) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  qr_payload text NULL,
  rfid_epc text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, sku_code),
  UNIQUE (tenant_id, description)
);

-- =====================================================================================
-- Inbound: ASN / GRN / Putaway
-- =====================================================================================
CREATE TABLE IF NOT EXISTS asns (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  asn_id text PRIMARY KEY DEFAULT ('ASN' || LPAD(NEXTVAL('asn_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  supplier_id text NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  eta date NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_transit','arrived','receiving','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancelled_at timestamptz NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS asn_lines (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  asn_line_id text PRIMARY KEY DEFAULT ('ASL' || LPAD(NEXTVAL('asn_line_id_seq')::text, 6, '0')),
  asn_id text NOT NULL REFERENCES asns(asn_id) ON DELETE CASCADE,
  line_no int NOT NULL,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  expected_qty numeric(18,4) NOT NULL CHECK (expected_qty >= 0),
  uom text NOT NULL DEFAULT 'EA',
  lot_no text NULL,
  serial_no text NULL,
  notes text NULL,
  UNIQUE (asn_id, line_no)
);

CREATE TABLE IF NOT EXISTS grns (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  grn_id text PRIMARY KEY DEFAULT ('GRN' || LPAD(NEXTVAL('grn_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  asn_id text NULL REFERENCES asns(asn_id) ON DELETE SET NULL,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'receiving'
    CHECK (status IN ('receiving','qc','putaway_pending','completed','cancelled')),
  received_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS grn_lines (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  grn_line_id text PRIMARY KEY DEFAULT ('GRL' || LPAD(NEXTVAL('grn_line_id_seq')::text, 6, '0')),
  grn_id text NOT NULL REFERENCES grns(grn_id) ON DELETE CASCADE,
  asn_line_id text NULL REFERENCES asn_lines(asn_line_id) ON DELETE SET NULL,
  line_no int NOT NULL,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  received_qty numeric(18,4) NOT NULL CHECK (received_qty >= 0),
  uom text NOT NULL DEFAULT 'EA',
  lot_no text NULL,
  serial_no text NULL,
  qc_status text NOT NULL DEFAULT 'pending'
    CHECK (qc_status IN ('pending','passed','failed')),
  putaway_qty numeric(18,4) NOT NULL DEFAULT 0 CHECK (putaway_qty >= 0),
  notes text NULL,
  UNIQUE (grn_id, line_no)
);

CREATE TABLE IF NOT EXISTS putaway_tasks (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  putaway_task_id text PRIMARY KEY DEFAULT ('PUT' || LPAD(NEXTVAL('putaway_task_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  grn_id text NOT NULL REFERENCES grns(grn_id) ON DELETE CASCADE,
  grn_line_id text NOT NULL REFERENCES grn_lines(grn_line_id) ON DELETE CASCADE,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  from_location_id text NULL REFERENCES locations(location_id) ON DELETE SET NULL,
  to_location_id text NULL REFERENCES locations(location_id) ON DELETE SET NULL,
  qty numeric(18,4) NOT NULL CHECK (qty >= 0),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','assigned','in_progress','done','cancelled','exception')),
  priority int NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  assigned_to_user_id text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  evidence_url text NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================================
-- Inventory: balances + transactions + cycle count + adjustments
-- =====================================================================================
CREATE TABLE IF NOT EXISTS inventory_balances (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  inv_balance_id text PRIMARY KEY DEFAULT ('INV' || LPAD(NEXTVAL('inv_balance_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  location_id text NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
  lot_no text NULL,
  serial_no text NULL,
  qty_on_hand numeric(18,4) NOT NULL DEFAULT 0,
  qty_reserved numeric(18,4) NOT NULL DEFAULT 0,
  qty_quarantine numeric(18,4) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Derived availability (use view or computed column logic in app; keep stored for simplicity)
  CONSTRAINT inventory_non_negative CHECK (qty_on_hand >= 0 AND qty_reserved >= 0 AND qty_quarantine >= 0)
);

-- Replaces expression-based UNIQUE constraint removed from public.inventory_balances:
-- UNIQUE (tenant_id, warehouse_id, sku_id, location_id, COALESCE(lot_no,''), COALESCE(serial_no,''))
CREATE UNIQUE INDEX IF NOT EXISTS ux_inventory_balances_coalesce_870dce0d ON public.inventory_balances (tenant_id, warehouse_id, sku_id, location_id, COALESCE(lot_no,''), COALESCE(serial_no,''));


CREATE TABLE IF NOT EXISTS inventory_transactions (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  itx_id text PRIMARY KEY DEFAULT ('ITX' || LPAD(NEXTVAL('itx_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  from_location_id text NULL REFERENCES locations(location_id) ON DELETE SET NULL,
  to_location_id text NULL REFERENCES locations(location_id) ON DELETE SET NULL,
  qty numeric(18,4) NOT NULL CHECK (qty <> 0),
  tx_type text NOT NULL
    CHECK (tx_type IN ('RECEIPT','PUTAWAY','MOVE','ALLOCATE','PICK','PACK','SHIP','RETURN','ADJUST','CYCLE_COUNT')),
  ref_type text NULL,
  ref_id text NULL,
  tx_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  notes text NULL
);

CREATE INDEX IF NOT EXISTS idx_itx_tenant_wh_at ON inventory_transactions(tenant_id, warehouse_id, tx_at DESC);
CREATE INDEX IF NOT EXISTS idx_itx_sku_at ON inventory_transactions(sku_id, tx_at DESC);

CREATE TABLE IF NOT EXISTS cycle_counts (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  cc_id text PRIMARY KEY DEFAULT ('CC' || LPAD(NEXTVAL('cc_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','in_progress','reconciled','closed','cancelled')),
  scheduled_at timestamptz NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS cycle_count_lines (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  ccl_id text PRIMARY KEY DEFAULT ('CCL' || LPAD(NEXTVAL('ccl_id_seq')::text, 6, '0')),
  cc_id text NOT NULL REFERENCES cycle_counts(cc_id) ON DELETE CASCADE,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  location_id text NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
  expected_qty numeric(18,4) NOT NULL DEFAULT 0,
  counted_qty numeric(18,4) NULL,
  variance_qty numeric(18,4) GENERATED ALWAYS AS (COALESCE(counted_qty,0) - expected_qty) STORED,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','counted','verified','exception')),
  notes text NULL
);

CREATE INDEX IF NOT EXISTS idx_ccl_cc ON cycle_count_lines(cc_id);
CREATE INDEX IF NOT EXISTS idx_ccl_sku_loc ON cycle_count_lines(sku_id, location_id);

CREATE TABLE IF NOT EXISTS adjustments (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  adj_id text PRIMARY KEY DEFAULT ('ADJ' || LPAD(NEXTVAL('adj_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','approved','rejected','posted','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  approved_at timestamptz NULL,
  approved_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS adjustment_lines (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  adj_line_id text PRIMARY KEY DEFAULT ('ADL' || LPAD(NEXTVAL('adj_line_id_seq')::text, 6, '0')),
  adj_id text NOT NULL REFERENCES adjustments(adj_id) ON DELETE CASCADE,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  location_id text NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
  qty_change numeric(18,4) NOT NULL CHECK (qty_change <> 0),
  lot_no text NULL,
  serial_no text NULL,
  notes text NULL
);

-- =====================================================================================
-- Outbound: Sales Orders / Picking / Packing / Shipping
-- =====================================================================================
CREATE TABLE IF NOT EXISTS sales_orders (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  so_id text PRIMARY KEY DEFAULT ('SO' || LPAD(NEXTVAL('so_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  customer_id text NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  ship_by_date date NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','allocated','picking','packed','shipped','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancelled_at timestamptz NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS sales_order_lines (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  so_line_id text PRIMARY KEY DEFAULT ('SOL' || LPAD(NEXTVAL('so_line_id_seq')::text, 6, '0')),
  so_id text NOT NULL REFERENCES sales_orders(so_id) ON DELETE CASCADE,
  line_no int NOT NULL,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  ordered_qty numeric(18,4) NOT NULL CHECK (ordered_qty >= 0),
  allocated_qty numeric(18,4) NOT NULL DEFAULT 0 CHECK (allocated_qty >= 0),
  shipped_qty numeric(18,4) NOT NULL DEFAULT 0 CHECK (shipped_qty >= 0),
  uom text NOT NULL DEFAULT 'EA',
  UNIQUE (so_id, line_no)
);

CREATE TABLE IF NOT EXISTS pick_waves (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  wave_id text PRIMARY KEY DEFAULT ('WAV' || LPAD(NEXTVAL('wave_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','released','in_progress','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS pick_tasks (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  pick_task_id text PRIMARY KEY DEFAULT ('PCK' || LPAD(NEXTVAL('pick_task_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  wave_id text NULL REFERENCES pick_waves(wave_id) ON DELETE SET NULL,
  so_id text NOT NULL REFERENCES sales_orders(so_id) ON DELETE CASCADE,
  so_line_id text NOT NULL REFERENCES sales_order_lines(so_line_id) ON DELETE CASCADE,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  from_location_id text NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
  qty numeric(18,4) NOT NULL CHECK (qty >= 0),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','assigned','in_progress','done','exception','cancelled')),
  assigned_to_user_id text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS packing_tasks (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  pack_task_id text PRIMARY KEY DEFAULT ('PKG' || LPAD(NEXTVAL('pack_task_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  so_id text NOT NULL REFERENCES sales_orders(so_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','packed','exception','cancelled')),
  packed_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  packed_at timestamptz NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  shipment_id text PRIMARY KEY DEFAULT ('SHP' || LPAD(NEXTVAL('shipment_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  so_id text NOT NULL REFERENCES sales_orders(so_id) ON DELETE CASCADE,
  carrier text NULL,
  tracking_no text NULL,
  ship_date date NULL,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','picked_up','in_transit','delivered','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancelled_at timestamptz NULL,
  cancellation_reason text NULL
);

-- =====================================================================================
-- Returns / RMA
-- =====================================================================================
CREATE TABLE IF NOT EXISTS returns (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  return_id text PRIMARY KEY DEFAULT ('RTN' || LPAD(NEXTVAL('return_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  so_id text NULL REFERENCES sales_orders(so_id) ON DELETE SET NULL,
  customer_id text NULL REFERENCES customers(customer_id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated','awaiting_receipt','received','inspected','closed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancelled_at timestamptz NULL,
  cancellation_reason text NULL
);

CREATE TABLE IF NOT EXISTS return_items (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  rmi_id text PRIMARY KEY DEFAULT ('RMI' || LPAD(NEXTVAL('rmi_id_seq')::text, 6, '0')),
  return_id text NOT NULL REFERENCES returns(return_id) ON DELETE CASCADE,
  sku_id text NOT NULL REFERENCES skus(sku_id) ON DELETE RESTRICT,
  qty numeric(18,4) NOT NULL CHECK (qty >= 0),
  reason text NULL,
  disposition text NOT NULL DEFAULT 'quarantine'
    CHECK (disposition IN ('restock','quarantine','scrap','return_to_vendor')),
  received_qty numeric(18,4) NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
  notes text NULL
);

CREATE TABLE IF NOT EXISTS rmas (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  rma_id text PRIMARY KEY DEFAULT ('RMA' || LPAD(NEXTVAL('rma_id_seq')::text, 6, '0')),
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  return_id text NOT NULL REFERENCES returns(return_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','issued','closed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  cancelled_at timestamptz NULL,
  cancellation_reason text NULL,
  UNIQUE (tenant_id, return_id)
);

-- =====================================================================================
-- Trace Timeline (SKU / EPC / QR) + Audit Log
-- =====================================================================================
CREATE TABLE IF NOT EXISTS trace_events (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  trace_event_id text PRIMARY KEY DEFAULT ('TRC' || LPAD(NEXTVAL('trace_event_seq')::text, 9, '0')),
  event_at timestamptz NOT NULL DEFAULT now(),
  event_type varchar(48) NOT NULL,
  status varchar(48) NULL,
  warehouse_id text NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
  sku_id text NULL REFERENCES skus(sku_id) ON DELETE SET NULL,
  lot_no text NULL,
  serial_no text NULL,
  rfid_epc text NULL,
  qr_payload text NULL,
  ref_type text NULL,
  ref_id text NULL,
  location_id text NULL REFERENCES locations(location_id) ON DELETE SET NULL,
  actor_user_id text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  details jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_trace_tenant_eventat ON trace_events(tenant_id, event_at DESC);
CREATE INDEX IF NOT EXISTS idx_trace_sku_eventat ON trace_events(sku_id, event_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  tenant_id text NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  audit_id text PRIMARY KEY DEFAULT ('AUD' || LPAD(NEXTVAL('audit_id_seq')::text, 6, '0')),
  event_at timestamptz NOT NULL DEFAULT now(),
  user_id text NULL REFERENCES users(user_id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NULL,
  entity_id text NULL,
  warehouse_id text NULL REFERENCES warehouses(warehouse_id) ON DELETE SET NULL,
  ip_address inet NULL,
  user_agent text NULL,
  details jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_eventat ON audit_logs(tenant_id, event_at DESC);

-- =====================================================================================
-- Dashboard Views (for the web portal dashboard)
-- =====================================================================================

-- Low stock view (reorder alert)
CREATE OR REPLACE VIEW v_inventory_low_stock AS
SELECT
  b.tenant_id,
  b.warehouse_id,
  b.sku_id,
  s.description AS sku_description,
  SUM(b.qty_on_hand - b.qty_reserved - b.qty_quarantine) AS available_qty,
  s.reorder_point,
  s.reorder_qty
FROM inventory_balances b
JOIN skus s ON s.sku_id = b.sku_id
GROUP BY b.tenant_id, b.warehouse_id, b.sku_id, s.description, s.reorder_point, s.reorder_qty
HAVING SUM(b.qty_on_hand - b.qty_reserved - b.qty_quarantine) <= s.reorder_point;

-- Inbound summary view
CREATE OR REPLACE VIEW v_inbound_summary AS
SELECT
  tenant_id,
  warehouse_id,
  COUNT(*) FILTER (WHERE status IN ('pending','in_transit','arrived','receiving')) AS asn_open,
  COUNT(*) FILTER (WHERE status = 'completed') AS asn_completed
FROM asns
GROUP BY tenant_id, warehouse_id;

-- Putaway workload
CREATE OR REPLACE VIEW v_putaway_workload AS
SELECT
  tenant_id,
  warehouse_id,
  COUNT(*) FILTER (WHERE status IN ('open','assigned','in_progress','exception')) AS putaway_open,
  COUNT(*) FILTER (WHERE status = 'done') AS putaway_done
FROM putaway_tasks
GROUP BY tenant_id, warehouse_id;

-- Outbound workload
CREATE OR REPLACE VIEW v_outbound_workload AS
SELECT
  tenant_id,
  warehouse_id,
  COUNT(*) FILTER (WHERE status IN ('open','assigned','in_progress','exception')) AS pick_open,
  COUNT(*) FILTER (WHERE status = 'done') AS pick_done
FROM pick_tasks
GROUP BY tenant_id, warehouse_id;

-- Dashboard KPIs (date-based counts)
CREATE OR REPLACE VIEW v_dashboard_kpis AS
WITH ctx AS (
  SELECT
    current_setting('app.tenant_id', true) AS tenant_id,
    current_setting('app.warehouse_id', true) AS warehouse_id
),
today_inbound AS (
  SELECT a.tenant_id, a.warehouse_id, COUNT(*) AS inbound_asn_due
  FROM asns a
  WHERE a.eta = CURRENT_DATE
  GROUP BY a.tenant_id, a.warehouse_id
),
today_grn AS (
  SELECT g.tenant_id, g.warehouse_id, COUNT(*) AS grn_today
  FROM grns g
  WHERE g.received_date = CURRENT_DATE
  GROUP BY g.tenant_id, g.warehouse_id
),
today_ship AS (
  SELECT sh.tenant_id, sh.warehouse_id, COUNT(*) AS shipments_today
  FROM shipments sh
  WHERE sh.ship_date = CURRENT_DATE
  GROUP BY sh.tenant_id, sh.warehouse_id
),
low_stock AS (
  SELECT tenant_id, warehouse_id, COUNT(*) AS low_stock_skus
  FROM v_inventory_low_stock
  GROUP BY tenant_id, warehouse_id
)
SELECT
  COALESCE(c.tenant_id, t.tenant_id) AS tenant_id,
  COALESCE(c.warehouse_id, t.warehouse_id) AS warehouse_id,
  COALESCE(t.inbound_asn_due, 0) AS inbound_asn_due_today,
  COALESCE(g.grn_today, 0) AS grns_received_today,
  COALESCE(p.putaway_open, 0) AS putaway_open,
  COALESCE(o.pick_open, 0) AS picks_open,
  COALESCE(s.shipments_today, 0) AS shipments_today,
  COALESCE(ls.low_stock_skus, 0) AS low_stock_skus
FROM ctx c
LEFT JOIN today_inbound t ON t.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR t.warehouse_id = c.warehouse_id)
LEFT JOIN today_grn g ON g.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR g.warehouse_id = c.warehouse_id)
LEFT JOIN v_putaway_workload p ON p.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR p.warehouse_id = c.warehouse_id)
LEFT JOIN v_outbound_workload o ON o.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR o.warehouse_id = c.warehouse_id)
LEFT JOIN today_ship s ON s.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR s.warehouse_id = c.warehouse_id)
LEFT JOIN low_stock ls ON ls.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR ls.warehouse_id = c.warehouse_id);

-- Trace Timeline view (join friendly names)
CREATE OR REPLACE VIEW v_trace_timeline AS
SELECT
  e.tenant_id,
  e.trace_event_id,
  e.event_at,
  e.event_type,
  e.status,
  e.warehouse_id,
  w.warehouse_name,
  e.sku_id,
  s.description AS sku_description,
  e.lot_no,
  e.serial_no,
  e.rfid_epc,
  e.qr_payload,
  e.location_id,
  l.label AS location_label,
  e.ref_type,
  e.ref_id,
  e.actor_user_id,
  u.user_name AS actor_name,
  e.details
FROM trace_events e
LEFT JOIN warehouses w ON w.warehouse_id = e.warehouse_id
LEFT JOIN skus s ON s.sku_id = e.sku_id
LEFT JOIN locations l ON l.location_id = e.location_id
LEFT JOIN users u ON u.user_id = e.actor_user_id;

-- =====================================================================================
-- Row Level Security (RLS)
-- =====================================================================================
-- Applies tenant isolation using app.tenant_id. API must always set app.tenant_id.
-- If app.tenant_id is NULL, queries will see 0 rows.

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'wms'
      AND tablename IN (
        'warehouses','locations','users','lov_groups','lov_values',
        'suppliers','customers','skus',
        'asns','asn_lines','grns','grn_lines','putaway_tasks',
        'inventory_balances','inventory_transactions','cycle_counts','cycle_count_lines',
        'adjustments','adjustment_lines',
        'sales_orders','sales_order_lines','pick_waves','pick_tasks','packing_tasks','shipments',
        'returns','return_items','rmas',
        'trace_events','audit_logs'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t.tablename);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t.tablename);

    -- Policy name is deterministic to avoid duplicates
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I;', t.tablename, t.tablename);

    EXECUTE format('CREATE POLICY tenant_isolation_%I ON public.%I USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());', t.tablename, t.tablename);
  END LOOP;
END $$;

-- Tenants table is typically managed by superadmin only (no RLS by default).
-- If you want full tenant RLS too, enable and add a separate policy.
