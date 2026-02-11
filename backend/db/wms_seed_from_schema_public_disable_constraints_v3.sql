-- Auto-generated seeding script aligned to wms_postgres_schema_public.sql
-- Disables FK enforcement (triggers) + drops CHECK constraints during seeding, then restores them.
-- Generated: 2026-02-11T02:35:34.365654

BEGIN;

-- Capture all CHECK constraints so we can restore later
CREATE TEMP TABLE IF NOT EXISTS _seed_check_constraints(
  table_name text NOT NULL,
  constraint_name text NOT NULL,
  constraint_def text NOT NULL
) ON COMMIT DROP;

TRUNCATE TABLE _seed_check_constraints;

INSERT INTO _seed_check_constraints(table_name, constraint_name, constraint_def)
SELECT
  c.conrelid::regclass::text AS table_name,
  c.conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_def
FROM pg_constraint c
JOIN pg_class r ON r.oid = c.conrelid
JOIN pg_namespace n ON n.oid = r.relnamespace
WHERE n.nspname = 'public'
  AND c.contype = 'c';

-- Drop all CHECK constraints
DO $$
DECLARE rec record;
BEGIN
  FOR rec IN SELECT table_name, constraint_name FROM _seed_check_constraints LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I;', rec.table_name, rec.constraint_name);
  END LOOP;
END $$;

-- Disable triggers (FK enforcement)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT format('%I.%I', n.nspname, c.relname) AS fqtn
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s DISABLE TRIGGER ALL;', r.fqtn);
    EXCEPTION WHEN insufficient_privilege THEN
      NULL;
    END;
  END LOOP;
END $$;

-- Optional: relax enforcement for superusers
DO $$
BEGIN
  BEGIN
    EXECUTE 'SET session_replication_role = replica';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;

-- Seed data (ordered by FK dependencies)
INSERT INTO public.tenants (tenant_id, tenant_name, status) VALUES ('TNT000001', 'Tenant 1', 'active') ON CONFLICT (tenant_id) DO NOTHING;
INSERT INTO public.roles (role_id, role_name, is_system) VALUES ('superadmin', 'Super Admin', true) ON CONFLICT (role_id) DO NOTHING;
INSERT INTO public.permissions (permission_id, permission_name) VALUES ('wms.all', 'All Permissions') ON CONFLICT (permission_id) DO NOTHING;
INSERT INTO public.users (tenant_id, user_id, clerk_user_id, email, user_name, is_active) VALUES ('TNT000001', 'USR000001', 'clerk_usr000001', 'admin@tenant1.local', 'Tenant1 Admin', true) ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.lov_groups (tenant_id, lov_group_id, group_code, group_name) VALUES ('TNT000001', 'LOV000001', 'GROUP_CODE_1', 'seed_group_name') ON CONFLICT (lov_group_id) DO NOTHING;
INSERT INTO public.skus (tenant_id, sku_id, sku_code, description, uom, status) VALUES ('TNT000001', 'SKU000001', 'SKU000001', 'Sample SKU 1', 'EA', 'active') ON CONFLICT (sku_id) DO NOTHING;
INSERT INTO public.customers (tenant_id, customer_id, customer_name) VALUES ('TNT000001', 'CUS000001', 'seed_customer_name') ON CONFLICT (customer_id) DO NOTHING;
INSERT INTO public.suppliers (tenant_id, supplier_id, supplier_name) VALUES ('TNT000001', 'SUP000001', 'seed_supplier_name') ON CONFLICT (supplier_id) DO NOTHING;
INSERT INTO public.warehouses (tenant_id, warehouse_id, warehouse_name, status) VALUES ('TNT000001', 'WH000001', 'Main DC', 'active') ON CONFLICT (warehouse_id) DO NOTHING;
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('ROL000001', 'ROL000002') ON CONFLICT (role_id, permission_id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role_id) VALUES ('USE000001', 'USE000002') ON CONFLICT (user_id, role_id) DO NOTHING;
INSERT INTO public.lov_values (tenant_id, lov_value_id, lov_group_id, value_code, value_label) VALUES ('TNT000001', 'LOV000001', 'LOV000001', 'VALUE_CODE_1', 'seed_value_label') ON CONFLICT (lov_value_id) DO NOTHING;
INSERT INTO public.cycle_counts (tenant_id, cc_id, warehouse_id) VALUES ('TNT000001', 'CYC000001', 'WH000001') ON CONFLICT (cc_id) DO NOTHING;
INSERT INTO public.adjustments (tenant_id, adj_id, warehouse_id, reason) VALUES ('TNT000001', 'ADJ000001', 'WH000001', 'seed_reason') ON CONFLICT (adj_id) DO NOTHING;
INSERT INTO public.asns (tenant_id, asn_id, warehouse_id, supplier_id) VALUES ('TNT000001', 'ASN000001', 'WH000001', 'SUP000001') ON CONFLICT (asn_id) DO NOTHING;
INSERT INTO public.sales_orders (tenant_id, so_id, warehouse_id, customer_id) VALUES ('TNT000001', 'SAL000001', 'WH000001', 'CUS000001') ON CONFLICT (so_id) DO NOTHING;
INSERT INTO public.user_warehouses (user_id, warehouse_id) VALUES ('USE000001', 'USE000002') ON CONFLICT (user_id, warehouse_id) DO NOTHING;
INSERT INTO public.pick_waves (tenant_id, wave_id, warehouse_id) VALUES ('TNT000001', 'PIC000001', 'WH000001') ON CONFLICT (wave_id) DO NOTHING;
INSERT INTO public.audit_logs (tenant_id, audit_id, action) VALUES ('TNT000001', 'AUD000001', 'seed_action') ON CONFLICT (audit_id) DO NOTHING;
INSERT INTO public.locations (tenant_id, location_id, warehouse_id, label) VALUES ('TNT000001', 'LOC000001', 'WH000001', 'seed_label') ON CONFLICT (location_id) DO NOTHING;
INSERT INTO public.grns (tenant_id, grn_id, warehouse_id) VALUES ('TNT000001', 'GRN000001', 'WH000001') ON CONFLICT (grn_id) DO NOTHING;
INSERT INTO public.asn_lines (tenant_id, asn_line_id, asn_id, line_no, sku_id, expected_qty) VALUES ('TNT000001', 'ASN000001', 'ASN000001', 1, 'SKU000001', 1) ON CONFLICT (asn_line_id) DO NOTHING;
INSERT INTO public.packing_tasks (tenant_id, pack_task_id, warehouse_id, so_id) VALUES ('TNT000001', 'PAC000001', 'WH000001', 'SAL000001') ON CONFLICT (pack_task_id) DO NOTHING;
INSERT INTO public.returns (tenant_id, return_id, warehouse_id) VALUES ('TNT000001', 'RET000001', 'WH000001') ON CONFLICT (return_id) DO NOTHING;
INSERT INTO public.shipments (tenant_id, shipment_id, warehouse_id, so_id) VALUES ('TNT000001', 'SHI000001', 'WH000001', 'SAL000001') ON CONFLICT (shipment_id) DO NOTHING;
INSERT INTO public.sales_order_lines (tenant_id, so_line_id, so_id, line_no, sku_id, ordered_qty) VALUES ('TNT000001', 'SAL000001', 'SAL000001', 1, 'SKU000001', 1) ON CONFLICT (so_line_id) DO NOTHING;
INSERT INTO public.cycle_count_lines (tenant_id, ccl_id, cc_id, sku_id, location_id) VALUES ('TNT000001', 'CYC000001', 'CYC000001', 'SKU000001', 'LOC000001') ON CONFLICT (ccl_id) DO NOTHING;
INSERT INTO public.trace_events (tenant_id, trace_event_id, event_type, warehouse_id) VALUES ('TNT000001', 'TRA000001', 'seed_event_type', 'WH000001') ON CONFLICT (trace_event_id) DO NOTHING;
INSERT INTO public.inventory_transactions (tenant_id, itx_id, warehouse_id, sku_id, qty) VALUES ('TNT000001', 'INV000001', 'WH000001', 'SKU000001', 1) ON CONFLICT (itx_id) DO NOTHING;
INSERT INTO public.inventory_balances (tenant_id, inv_balance_id, warehouse_id, sku_id, location_id) VALUES ('TNT000001', 'INV000001', 'WH000001', 'SKU000001', 'LOC000001') ON CONFLICT (inv_balance_id) DO NOTHING;
INSERT INTO public.adjustment_lines (tenant_id, adj_line_id, adj_id, sku_id, location_id, qty_change) VALUES ('TNT000001', 'ADJ000001', 'ADJ000001', 'SKU000001', 'LOC000001', 1) ON CONFLICT (adj_line_id) DO NOTHING;
INSERT INTO public.grn_lines (tenant_id, grn_line_id, grn_id, line_no, sku_id, received_qty) VALUES ('TNT000001', 'GRN000001', 'GRN000001', 1, 'SKU000001', 1) ON CONFLICT (grn_line_id) DO NOTHING;
INSERT INTO public.rmas (tenant_id, rma_id, warehouse_id, return_id) VALUES ('TNT000001', 'RMA000001', 'WH000001', 'RET000001') ON CONFLICT (rma_id) DO NOTHING;
INSERT INTO public.return_items (tenant_id, rmi_id, return_id, sku_id, qty) VALUES ('TNT000001', 'RET000001', 'RET000001', 'SKU000001', 1) ON CONFLICT (rmi_id) DO NOTHING;
INSERT INTO public.pick_tasks (tenant_id, pick_task_id, warehouse_id, so_id, so_line_id, sku_id, from_location_id, qty) VALUES ('TNT000001', 'PIC000001', 'WH000001', 'SAL000001', 'SAL000001', 'SKU000001', 'LOC000001', 1) ON CONFLICT (pick_task_id) DO NOTHING;
INSERT INTO public.putaway_tasks (tenant_id, putaway_task_id, warehouse_id, grn_id, grn_line_id, sku_id, qty) VALUES ('TNT000001', 'PUT000001', 'WH000001', 'GRN000001', 'GRN000001', 'SKU000001', 1) ON CONFLICT (putaway_task_id) DO NOTHING;

-- Restore replication role
DO $$
BEGIN
  BEGIN
    EXECUTE 'SET session_replication_role = origin';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;

-- Re-enable triggers
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT format('%I.%I', n.nspname, c.relname) AS fqtn
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s ENABLE TRIGGER ALL;', r.fqtn);
    EXCEPTION WHEN insufficient_privilege THEN
      NULL;
    END;
  END LOOP;
END $$;

-- Restore CHECK constraints exactly
DO $$
DECLARE rec record;
BEGIN
  FOR rec IN SELECT table_name, constraint_name, constraint_def FROM _seed_check_constraints LOOP
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s;', rec.table_name, rec.constraint_name, rec.constraint_def);
  END LOOP;
END $$;

COMMIT;
