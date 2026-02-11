-- public.permissions definition

-- Drop table

-- DROP TABLE public.permissions;

CREATE TABLE public.permissions ( permission_id text NOT NULL, permission_name text NOT NULL, description text NULL, CONSTRAINT permissions_pkey PRIMARY KEY (permission_id));

-- Permissions

ALTER TABLE public.permissions OWNER TO postgres;
GRANT ALL ON TABLE public.permissions TO postgres;


-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles ( role_id text NOT NULL, role_name text NOT NULL, description text NULL, is_system bool DEFAULT false NOT NULL, CONSTRAINT roles_pkey PRIMARY KEY (role_id), CONSTRAINT roles_role_id_check CHECK ((role_id = lower(role_id))));

-- Permissions

ALTER TABLE public.roles OWNER TO postgres;
GRANT ALL ON TABLE public.roles TO postgres;


-- public.tenants definition

-- Drop table

-- DROP TABLE public.tenants;

CREATE TABLE public.tenants ( tenant_id text DEFAULT 'TNT'::text || lpad(nextval('tenant_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, tenant_name text NOT NULL, status text DEFAULT 'active'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT tenants_pkey PRIMARY KEY (tenant_id), CONSTRAINT tenants_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))));

-- Permissions

ALTER TABLE public.tenants OWNER TO postgres;
GRANT ALL ON TABLE public.tenants TO postgres;


-- public.customers definition

-- Drop table

-- DROP TABLE public.customers;

CREATE TABLE public.customers ( tenant_id text NOT NULL, customer_id text DEFAULT 'CUS'::text || lpad(nextval('customer_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, customer_name text NOT NULL, customer_code text NULL, email public."citext" NULL, phone text NULL, address text NULL, status text DEFAULT 'active'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT customers_pkey PRIMARY KEY (customer_id), CONSTRAINT customers_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))), CONSTRAINT customers_tenant_id_customer_name_key UNIQUE (tenant_id, customer_name), CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.customers OWNER TO postgres;
GRANT ALL ON TABLE public.customers TO postgres;


-- public.lov_groups definition

-- Drop table

-- DROP TABLE public.lov_groups;

CREATE TABLE public.lov_groups ( tenant_id text NOT NULL, lov_group_id text DEFAULT 'LVG'::text || lpad(nextval('lov_group_seq'::regclass)::text, 6, '0'::text) NOT NULL, group_code text NOT NULL, group_name text NOT NULL, description text NULL, is_system bool DEFAULT false NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT lov_groups_pkey PRIMARY KEY (lov_group_id), CONSTRAINT lov_groups_tenant_id_group_code_key UNIQUE (tenant_id, group_code), CONSTRAINT lov_groups_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.lov_groups OWNER TO postgres;
GRANT ALL ON TABLE public.lov_groups TO postgres;


-- public.lov_values definition

-- Drop table

-- DROP TABLE public.lov_values;

CREATE TABLE public.lov_values ( tenant_id text NOT NULL, lov_value_id text DEFAULT 'LVV'::text || lpad(nextval('lov_value_seq'::regclass)::text, 6, '0'::text) NOT NULL, lov_group_id text NOT NULL, value_code text NOT NULL, value_label text NOT NULL, sort_order int4 DEFAULT 0 NOT NULL, is_active bool DEFAULT true NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT lov_values_pkey PRIMARY KEY (lov_value_id), CONSTRAINT lov_values_tenant_id_lov_group_id_value_code_key UNIQUE (tenant_id, lov_group_id, value_code), CONSTRAINT lov_values_lov_group_id_fkey FOREIGN KEY (lov_group_id) REFERENCES public.lov_groups(lov_group_id) ON DELETE CASCADE, CONSTRAINT lov_values_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.lov_values OWNER TO postgres;
GRANT ALL ON TABLE public.lov_values TO postgres;


-- public.role_permissions definition

-- Drop table

-- DROP TABLE public.role_permissions;

CREATE TABLE public.role_permissions ( role_id text NOT NULL, permission_id text NOT NULL, CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id), CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE, CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.role_permissions OWNER TO postgres;
GRANT ALL ON TABLE public.role_permissions TO postgres;


-- public.skus definition

-- Drop table

-- DROP TABLE public.skus;

CREATE TABLE public.skus ( tenant_id text NOT NULL, sku_id text DEFAULT 'SKU'::text || lpad(nextval('sku_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, sku_code text NULL, description text NOT NULL, uom text DEFAULT 'EA'::text NOT NULL, category text NULL, hazardous bool DEFAULT false NOT NULL, weight numeric(12, 4) NULL, dimensions text NULL, reorder_point numeric(18, 4) DEFAULT 0 NOT NULL, reorder_qty numeric(18, 4) DEFAULT 0 NOT NULL, status text DEFAULT 'active'::text NOT NULL, qr_payload text NULL, rfid_epc text NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT skus_pkey PRIMARY KEY (sku_id), CONSTRAINT skus_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))), CONSTRAINT skus_tenant_id_description_key UNIQUE (tenant_id, description), CONSTRAINT skus_tenant_id_sku_code_key UNIQUE (tenant_id, sku_code), CONSTRAINT skus_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.skus OWNER TO postgres;
GRANT ALL ON TABLE public.skus TO postgres;


-- public.suppliers definition

-- Drop table

-- DROP TABLE public.suppliers;

CREATE TABLE public.suppliers ( tenant_id text NOT NULL, supplier_id text DEFAULT 'SUP'::text || lpad(nextval('supplier_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, supplier_name text NOT NULL, supplier_code text NULL, email public."citext" NULL, phone text NULL, address text NULL, status text DEFAULT 'active'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id), CONSTRAINT suppliers_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))), CONSTRAINT suppliers_tenant_id_supplier_name_key UNIQUE (tenant_id, supplier_name), CONSTRAINT suppliers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.suppliers OWNER TO postgres;
GRANT ALL ON TABLE public.suppliers TO postgres;


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users ( tenant_id text NOT NULL, user_id text DEFAULT 'USR'::text || lpad(nextval('user_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, clerk_user_id text NULL, email public."citext" NULL, user_name text NOT NULL, is_active bool DEFAULT true NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT users_clerk_user_id_key UNIQUE (clerk_user_id), CONSTRAINT users_email_key UNIQUE (email), CONSTRAINT users_pkey PRIMARY KEY (user_id), CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.users OWNER TO postgres;
GRANT ALL ON TABLE public.users TO postgres;


-- public.warehouses definition

-- Drop table

-- DROP TABLE public.warehouses;

CREATE TABLE public.warehouses ( tenant_id text NOT NULL, warehouse_id text DEFAULT 'WH'::text || lpad(nextval('warehouse_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_name text NOT NULL, city text NULL, country text NULL, status text DEFAULT 'active'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT warehouses_pkey PRIMARY KEY (warehouse_id), CONSTRAINT warehouses_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))), CONSTRAINT warehouses_tenant_id_warehouse_name_key UNIQUE (tenant_id, warehouse_name), CONSTRAINT warehouses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.warehouses OWNER TO postgres;
GRANT ALL ON TABLE public.warehouses TO postgres;


-- public.adjustments definition

-- Drop table

-- DROP TABLE public.adjustments;

CREATE TABLE public.adjustments ( tenant_id text NOT NULL, adj_id text DEFAULT 'ADJ'::text || lpad(nextval('adj_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, reason text NOT NULL, status text DEFAULT 'draft'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, approved_at timestamptz NULL, approved_by text NULL, cancellation_reason text NULL, CONSTRAINT adjustments_pkey PRIMARY KEY (adj_id), CONSTRAINT adjustments_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text, 'rejected'::text, 'posted'::text, 'cancelled'::text]))), CONSTRAINT adjustments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT adjustments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT adjustments_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.adjustments OWNER TO postgres;
GRANT ALL ON TABLE public.adjustments TO postgres;


-- public.asns definition

-- Drop table

-- DROP TABLE public.asns;

CREATE TABLE public.asns ( tenant_id text NOT NULL, asn_id text DEFAULT 'ASN'::text || lpad(nextval('asn_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, supplier_id text NOT NULL, eta date NULL, status text DEFAULT 'pending'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, cancelled_at timestamptz NULL, cancellation_reason text NULL, CONSTRAINT asns_pkey PRIMARY KEY (asn_id), CONSTRAINT asns_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_transit'::text, 'arrived'::text, 'receiving'::text, 'completed'::text, 'cancelled'::text]))), CONSTRAINT asns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT asns_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id) ON DELETE RESTRICT, CONSTRAINT asns_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT asns_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.asns OWNER TO postgres;
GRANT ALL ON TABLE public.asns TO postgres;


-- public.audit_logs definition

-- Drop table

-- DROP TABLE public.audit_logs;

CREATE TABLE public.audit_logs ( tenant_id text NOT NULL, audit_id text DEFAULT 'AUD'::text || lpad(nextval('audit_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, event_at timestamptz DEFAULT now() NOT NULL, user_id text NULL, "action" text NOT NULL, entity_type text NULL, entity_id text NULL, warehouse_id text NULL, ip_address inet NULL, user_agent text NULL, details jsonb NULL, CONSTRAINT audit_logs_pkey PRIMARY KEY (audit_id), CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT audit_logs_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE SET NULL);
CREATE INDEX idx_audit_tenant_eventat ON public.audit_logs USING btree (tenant_id, event_at DESC);

-- Permissions

ALTER TABLE public.audit_logs OWNER TO postgres;
GRANT ALL ON TABLE public.audit_logs TO postgres;


-- public.count_plans definition

-- Drop table

-- DROP TABLE public.count_plans;

CREATE TABLE public.count_plans ( count_id text NOT NULL, tenant_id text NOT NULL, zone_id text NULL, planned_date date NULL, status text DEFAULT 'DRAFT'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, submitted_at timestamptz NULL, submitted_by text NULL, approved_at timestamptz NULL, approved_by text NULL, approval_note text NULL, cancellation_reason text NULL, CONSTRAINT count_plans_pkey PRIMARY KEY (count_id), CONSTRAINT count_plans_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT count_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT count_plans_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT count_plans_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.count_plans OWNER TO postgres;
GRANT ALL ON TABLE public.count_plans TO postgres;


-- public.cycle_counts definition

-- Drop table

-- DROP TABLE public.cycle_counts;

CREATE TABLE public.cycle_counts ( tenant_id text NOT NULL, cc_id text DEFAULT 'CC'::text || lpad(nextval('cc_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, status text DEFAULT 'planned'::text NOT NULL, scheduled_at timestamptz NULL, started_at timestamptz NULL, completed_at timestamptz NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, cancellation_reason text NULL, CONSTRAINT cycle_counts_pkey PRIMARY KEY (cc_id), CONSTRAINT cycle_counts_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'in_progress'::text, 'reconciled'::text, 'closed'::text, 'cancelled'::text]))), CONSTRAINT cycle_counts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT cycle_counts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT cycle_counts_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.cycle_counts OWNER TO postgres;
GRANT ALL ON TABLE public.cycle_counts TO postgres;


-- public.grns definition

-- Drop table

-- DROP TABLE public.grns;

CREATE TABLE public.grns ( tenant_id text NOT NULL, grn_id text DEFAULT 'GRN'::text || lpad(nextval('grn_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, asn_id text NULL, received_date date DEFAULT CURRENT_DATE NOT NULL, status text DEFAULT 'receiving'::text NOT NULL, received_by text NULL, created_at timestamptz DEFAULT now() NOT NULL, cancelled_at timestamptz NULL, cancellation_reason text NULL, CONSTRAINT grns_pkey PRIMARY KEY (grn_id), CONSTRAINT grns_status_check CHECK ((status = ANY (ARRAY['receiving'::text, 'qc'::text, 'putaway_pending'::text, 'completed'::text, 'cancelled'::text]))), CONSTRAINT grns_asn_id_fkey FOREIGN KEY (asn_id) REFERENCES public.asns(asn_id) ON DELETE SET NULL, CONSTRAINT grns_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT grns_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT grns_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.grns OWNER TO postgres;
GRANT ALL ON TABLE public.grns TO postgres;


-- public.locations definition

-- Drop table

-- DROP TABLE public.locations;

CREATE TABLE public.locations ( tenant_id text NOT NULL, location_id text DEFAULT 'LOC'::text || lpad(nextval('location_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, "zone" text NULL, aisle text NULL, rack text NULL, bin text NULL, "label" text NOT NULL, location_type text DEFAULT 'storage'::text NOT NULL, is_active bool DEFAULT true NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT locations_location_type_check CHECK ((location_type = ANY (ARRAY['storage'::text, 'dock'::text, 'staging'::text, 'quarantine'::text, 'packing'::text, 'shipping'::text, 'receiving'::text]))), CONSTRAINT locations_pkey PRIMARY KEY (location_id), CONSTRAINT locations_tenant_id_warehouse_id_label_key UNIQUE (tenant_id, warehouse_id, label), CONSTRAINT locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT locations_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.locations OWNER TO postgres;
GRANT ALL ON TABLE public.locations TO postgres;


-- public.pick_waves definition

-- Drop table

-- DROP TABLE public.pick_waves;

CREATE TABLE public.pick_waves ( tenant_id text NOT NULL, wave_id text DEFAULT 'WAV'::text || lpad(nextval('wave_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, status text DEFAULT 'open'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, cancellation_reason text NULL, CONSTRAINT pick_waves_pkey PRIMARY KEY (wave_id), CONSTRAINT pick_waves_status_check CHECK ((status = ANY (ARRAY['open'::text, 'released'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))), CONSTRAINT pick_waves_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT pick_waves_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT pick_waves_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.pick_waves OWNER TO postgres;
GRANT ALL ON TABLE public.pick_waves TO postgres;


-- public.sales_orders definition

-- Drop table

-- DROP TABLE public.sales_orders;

CREATE TABLE public.sales_orders ( tenant_id text NOT NULL, so_id text DEFAULT 'SO'::text || lpad(nextval('so_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, customer_id text NOT NULL, order_date date DEFAULT CURRENT_DATE NOT NULL, ship_by_date date NULL, status text DEFAULT 'open'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, cancelled_at timestamptz NULL, cancellation_reason text NULL, CONSTRAINT sales_orders_pkey PRIMARY KEY (so_id), CONSTRAINT sales_orders_status_check CHECK ((status = ANY (ARRAY['open'::text, 'allocated'::text, 'picking'::text, 'packed'::text, 'shipped'::text, 'cancelled'::text]))), CONSTRAINT sales_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT sales_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE RESTRICT, CONSTRAINT sales_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT sales_orders_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.sales_orders OWNER TO postgres;
GRANT ALL ON TABLE public.sales_orders TO postgres;


-- public.shipments definition

-- Drop table

-- DROP TABLE public.shipments;

CREATE TABLE public.shipments ( tenant_id text NOT NULL, shipment_id text DEFAULT 'SHP'::text || lpad(nextval('shipment_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, so_id text NOT NULL, carrier text NULL, tracking_no text NULL, ship_date date NULL, status text DEFAULT 'planned'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, cancelled_at timestamptz NULL, cancellation_reason text NULL, CONSTRAINT shipments_pkey PRIMARY KEY (shipment_id), CONSTRAINT shipments_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'picked_up'::text, 'in_transit'::text, 'delivered'::text, 'cancelled'::text]))), CONSTRAINT shipments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT shipments_so_id_fkey FOREIGN KEY (so_id) REFERENCES public.sales_orders(so_id) ON DELETE CASCADE, CONSTRAINT shipments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT shipments_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.shipments OWNER TO postgres;
GRANT ALL ON TABLE public.shipments TO postgres;


-- public.trace_events definition

-- Drop table

-- DROP TABLE public.trace_events;

CREATE TABLE public.trace_events ( tenant_id text NOT NULL, trace_event_id text DEFAULT 'TRC'::text || lpad(nextval('trace_event_seq'::regclass)::text, 9, '0'::text) NOT NULL, event_at timestamptz DEFAULT now() NOT NULL, event_type varchar(48) NOT NULL, status varchar(48) NULL, warehouse_id text NOT NULL, sku_id text NULL, lot_no text NULL, serial_no text NULL, rfid_epc text NULL, qr_payload text NULL, ref_type text NULL, ref_id text NULL, location_id text NULL, actor_user_id text NULL, details jsonb NULL, warehouse_name text NULL, process text NULL, location_code text NULL, location_path text NULL, actor_type text NULL, actor_id text NULL, actor_name text NULL, device_code text NULL, system_code text NULL, sku_code text NULL, epc text NULL, ref_no text NULL, CONSTRAINT trace_events_pkey PRIMARY KEY (trace_event_id), CONSTRAINT trace_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT trace_events_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL, CONSTRAINT trace_events_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE SET NULL, CONSTRAINT trace_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT trace_events_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);
CREATE INDEX idx_trace_sku_eventat ON public.trace_events USING btree (sku_id, event_at DESC);
CREATE INDEX idx_trace_tenant_eventat ON public.trace_events USING btree (tenant_id, event_at DESC);

-- Permissions

ALTER TABLE public.trace_events OWNER TO postgres;
GRANT ALL ON TABLE public.trace_events TO postgres;


-- public.user_roles definition

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles ( user_id text NOT NULL, role_id text NOT NULL, CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id), CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE RESTRICT, CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.user_roles OWNER TO postgres;
GRANT ALL ON TABLE public.user_roles TO postgres;


-- public.user_warehouses definition

-- Drop table

-- DROP TABLE public.user_warehouses;

CREATE TABLE public.user_warehouses ( user_id text NOT NULL, warehouse_id text NOT NULL, CONSTRAINT user_warehouses_pkey PRIMARY KEY (user_id, warehouse_id), CONSTRAINT user_warehouses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE, CONSTRAINT user_warehouses_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.user_warehouses OWNER TO postgres;
GRANT ALL ON TABLE public.user_warehouses TO postgres;


-- public.adjustment_lines definition

-- Drop table

-- DROP TABLE public.adjustment_lines;

CREATE TABLE public.adjustment_lines ( tenant_id text NOT NULL, adj_line_id text DEFAULT 'ADL'::text || lpad(nextval('adj_line_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, adj_id text NOT NULL, sku_id text NOT NULL, location_id text NOT NULL, qty_change numeric(18, 4) NOT NULL, lot_no text NULL, serial_no text NULL, notes text NULL, CONSTRAINT adjustment_lines_pkey PRIMARY KEY (adj_line_id), CONSTRAINT adjustment_lines_qty_change_check CHECK ((qty_change <> (0)::numeric)), CONSTRAINT adjustment_lines_adj_id_fkey FOREIGN KEY (adj_id) REFERENCES public.adjustments(adj_id) ON DELETE CASCADE, CONSTRAINT adjustment_lines_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE RESTRICT, CONSTRAINT adjustment_lines_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT adjustment_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.adjustment_lines OWNER TO postgres;
GRANT ALL ON TABLE public.adjustment_lines TO postgres;


-- public.adjustment_requests definition

-- Drop table

-- DROP TABLE public.adjustment_requests;

CREATE TABLE public.adjustment_requests ( adj_id text NOT NULL, tenant_id text NOT NULL, status text DEFAULT 'PENDING'::text NOT NULL, sku_id text NULL, location_id text NULL, qty_delta numeric(18, 4) DEFAULT 0 NOT NULL, reason_code text NULL, requested_by text NULL, requested_at timestamptz DEFAULT now() NOT NULL, approved_by text NULL, approved_at timestamptz NULL, approval_note text NULL, cancellation_reason text NULL, CONSTRAINT adjustment_requests_pkey PRIMARY KEY (adj_id), CONSTRAINT adjustment_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT adjustment_requests_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL, CONSTRAINT adjustment_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT adjustment_requests_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE SET NULL, CONSTRAINT adjustment_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.adjustment_requests OWNER TO postgres;
GRANT ALL ON TABLE public.adjustment_requests TO postgres;


-- public.asn_lines definition

-- Drop table

-- DROP TABLE public.asn_lines;

CREATE TABLE public.asn_lines ( tenant_id text NOT NULL, asn_line_id text DEFAULT 'ASL'::text || lpad(nextval('asn_line_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, asn_id text NOT NULL, line_no int4 NOT NULL, sku_id text NOT NULL, expected_qty numeric(18, 4) NOT NULL, uom text DEFAULT 'EA'::text NOT NULL, lot_no text NULL, serial_no text NULL, notes text NULL, CONSTRAINT asn_lines_asn_id_line_no_key UNIQUE (asn_id, line_no), CONSTRAINT asn_lines_expected_qty_check CHECK ((expected_qty >= (0)::numeric)), CONSTRAINT asn_lines_pkey PRIMARY KEY (asn_line_id), CONSTRAINT asn_lines_asn_id_fkey FOREIGN KEY (asn_id) REFERENCES public.asns(asn_id) ON DELETE CASCADE, CONSTRAINT asn_lines_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT asn_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.asn_lines OWNER TO postgres;
GRANT ALL ON TABLE public.asn_lines TO postgres;


-- public.count_plan_lines definition

-- Drop table

-- DROP TABLE public.count_plan_lines;

CREATE TABLE public.count_plan_lines ( line_id text NOT NULL, tenant_id text NOT NULL, count_id text NOT NULL, sku_id text NULL, location_id text NULL, system_qty numeric(18, 4) NULL, counted_qty numeric(18, 4) NULL, variance_qty numeric(18, 4) NULL, status text NULL, CONSTRAINT count_plan_lines_pkey PRIMARY KEY (line_id), CONSTRAINT count_plan_lines_count_id_fkey FOREIGN KEY (count_id) REFERENCES public.count_plans(count_id) ON DELETE CASCADE, CONSTRAINT count_plan_lines_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL, CONSTRAINT count_plan_lines_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE SET NULL, CONSTRAINT count_plan_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.count_plan_lines OWNER TO postgres;
GRANT ALL ON TABLE public.count_plan_lines TO postgres;


-- public.cycle_count_lines definition

-- Drop table

-- DROP TABLE public.cycle_count_lines;

CREATE TABLE public.cycle_count_lines ( tenant_id text NOT NULL, ccl_id text DEFAULT 'CCL'::text || lpad(nextval('ccl_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, cc_id text NOT NULL, sku_id text NOT NULL, location_id text NOT NULL, expected_qty numeric(18, 4) DEFAULT 0 NOT NULL, counted_qty numeric(18, 4) NULL, variance_qty numeric(18, 4) GENERATED ALWAYS AS ((COALESCE(counted_qty, 0::numeric) - expected_qty)) STORED NULL, status text DEFAULT 'pending'::text NOT NULL, notes text NULL, CONSTRAINT cycle_count_lines_pkey PRIMARY KEY (ccl_id), CONSTRAINT cycle_count_lines_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'counted'::text, 'verified'::text, 'exception'::text]))), CONSTRAINT cycle_count_lines_cc_id_fkey FOREIGN KEY (cc_id) REFERENCES public.cycle_counts(cc_id) ON DELETE CASCADE, CONSTRAINT cycle_count_lines_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE RESTRICT, CONSTRAINT cycle_count_lines_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT cycle_count_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);
CREATE INDEX idx_ccl_cc ON public.cycle_count_lines USING btree (cc_id);
CREATE INDEX idx_ccl_sku_loc ON public.cycle_count_lines USING btree (sku_id, location_id);

-- Permissions

ALTER TABLE public.cycle_count_lines OWNER TO postgres;
GRANT ALL ON TABLE public.cycle_count_lines TO postgres;


-- public.grn_lines definition

-- Drop table

-- DROP TABLE public.grn_lines;

CREATE TABLE public.grn_lines ( tenant_id text NOT NULL, grn_line_id text DEFAULT 'GRL'::text || lpad(nextval('grn_line_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, grn_id text NOT NULL, asn_line_id text NULL, line_no int4 NOT NULL, sku_id text NOT NULL, received_qty numeric(18, 4) NOT NULL, uom text DEFAULT 'EA'::text NOT NULL, lot_no text NULL, serial_no text NULL, qc_status text DEFAULT 'pending'::text NOT NULL, putaway_qty numeric(18, 4) DEFAULT 0 NOT NULL, notes text NULL, CONSTRAINT grn_lines_grn_id_line_no_key UNIQUE (grn_id, line_no), CONSTRAINT grn_lines_pkey PRIMARY KEY (grn_line_id), CONSTRAINT grn_lines_putaway_qty_check CHECK ((putaway_qty >= (0)::numeric)), CONSTRAINT grn_lines_qc_status_check CHECK ((qc_status = ANY (ARRAY['pending'::text, 'passed'::text, 'failed'::text]))), CONSTRAINT grn_lines_received_qty_check CHECK ((received_qty >= (0)::numeric)), CONSTRAINT grn_lines_asn_line_id_fkey FOREIGN KEY (asn_line_id) REFERENCES public.asn_lines(asn_line_id) ON DELETE SET NULL, CONSTRAINT grn_lines_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.grns(grn_id) ON DELETE CASCADE, CONSTRAINT grn_lines_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT grn_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.grn_lines OWNER TO postgres;
GRANT ALL ON TABLE public.grn_lines TO postgres;


-- public.inventory_balances definition

-- Drop table

-- DROP TABLE public.inventory_balances;

CREATE TABLE public.inventory_balances ( tenant_id text NOT NULL, inv_balance_id text DEFAULT 'INV'::text || lpad(nextval('inv_balance_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, sku_id text NOT NULL, location_id text NOT NULL, lot_no text NULL, serial_no text NULL, qty_on_hand numeric(18, 4) DEFAULT 0 NOT NULL, qty_reserved numeric(18, 4) DEFAULT 0 NOT NULL, qty_quarantine numeric(18, 4) DEFAULT 0 NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT inventory_balances_pkey PRIMARY KEY (inv_balance_id), CONSTRAINT inventory_non_negative CHECK (((qty_on_hand >= (0)::numeric) AND (qty_reserved >= (0)::numeric) AND (qty_quarantine >= (0)::numeric))), CONSTRAINT inventory_balances_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE RESTRICT, CONSTRAINT inventory_balances_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT inventory_balances_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT inventory_balances_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);
CREATE UNIQUE INDEX ux_inventory_balances_coalesce_870dce0d ON public.inventory_balances USING btree (tenant_id, warehouse_id, sku_id, location_id, COALESCE(lot_no, ''::text), COALESCE(serial_no, ''::text));

-- Permissions

ALTER TABLE public.inventory_balances OWNER TO postgres;
GRANT ALL ON TABLE public.inventory_balances TO postgres;


-- public.inventory_transactions definition

-- Drop table

-- DROP TABLE public.inventory_transactions;

CREATE TABLE public.inventory_transactions ( tenant_id text NOT NULL, itx_id text DEFAULT 'ITX'::text || lpad(nextval('itx_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, sku_id text NOT NULL, from_location_id text NULL, to_location_id text NULL, qty numeric(18, 4) NOT NULL, tx_type text NULL, ref_type text NULL, ref_id text NULL, tx_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, notes text NULL, txn_id text NULL, txn_type text NULL, uom_id text NULL, reference_type text NULL, reference_id text NULL, reason_code text NULL, created_at timestamptz NULL, CONSTRAINT inventory_transactions_pkey PRIMARY KEY (itx_id), CONSTRAINT inventory_transactions_qty_check CHECK ((qty <> (0)::numeric)), CONSTRAINT inventory_transactions_tx_type_check CHECK ((tx_type = ANY (ARRAY['RECEIPT'::text, 'PUTAWAY'::text, 'MOVE'::text, 'ALLOCATE'::text, 'PICK'::text, 'PACK'::text, 'SHIP'::text, 'RETURN'::text, 'ADJUST'::text, 'CYCLE_COUNT'::text]))), CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT inventory_transactions_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL, CONSTRAINT inventory_transactions_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT inventory_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT inventory_transactions_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL, CONSTRAINT inventory_transactions_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);
CREATE INDEX idx_itx_sku_at ON public.inventory_transactions USING btree (sku_id, tx_at DESC);
CREATE INDEX idx_itx_tenant_wh_at ON public.inventory_transactions USING btree (tenant_id, warehouse_id, tx_at DESC);

-- Permissions

ALTER TABLE public.inventory_transactions OWNER TO postgres;
GRANT ALL ON TABLE public.inventory_transactions TO postgres;


-- public.packing_tasks definition

-- Drop table

-- DROP TABLE public.packing_tasks;

CREATE TABLE public.packing_tasks ( tenant_id text NOT NULL, pack_task_id text DEFAULT 'PKG'::text || lpad(nextval('pack_task_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, so_id text NOT NULL, status text DEFAULT 'pending'::text NOT NULL, packed_by text NULL, packed_at timestamptz NULL, notes text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT packing_tasks_pkey PRIMARY KEY (pack_task_id), CONSTRAINT packing_tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'packed'::text, 'exception'::text, 'cancelled'::text]))), CONSTRAINT packing_tasks_packed_by_fkey FOREIGN KEY (packed_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT packing_tasks_so_id_fkey FOREIGN KEY (so_id) REFERENCES public.sales_orders(so_id) ON DELETE CASCADE, CONSTRAINT packing_tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT packing_tasks_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.packing_tasks OWNER TO postgres;
GRANT ALL ON TABLE public.packing_tasks TO postgres;


-- public.putaway_tasks definition

-- Drop table

-- DROP TABLE public.putaway_tasks;

CREATE TABLE public.putaway_tasks ( tenant_id text NOT NULL, putaway_task_id text DEFAULT 'PUT'::text || lpad(nextval('putaway_task_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, grn_id text NOT NULL, grn_line_id text NOT NULL, sku_id text NOT NULL, from_location_id text NULL, to_location_id text NULL, qty numeric(18, 4) NOT NULL, status text DEFAULT 'open'::text NOT NULL, priority int4 DEFAULT 3 NOT NULL, assigned_to_user_id text NULL, started_at timestamptz NULL, completed_at timestamptz NULL, evidence_url text NULL, notes text NULL, created_at timestamptz DEFAULT now() NOT NULL, task_id text GENERATED ALWAYS AS (putaway_task_id) STORED NULL, CONSTRAINT putaway_tasks_pkey PRIMARY KEY (putaway_task_id), CONSTRAINT putaway_tasks_priority_check CHECK (((priority >= 1) AND (priority <= 5))), CONSTRAINT putaway_tasks_qty_check CHECK ((qty >= (0)::numeric)), CONSTRAINT putaway_tasks_status_check CHECK ((status = ANY (ARRAY['open'::text, 'assigned'::text, 'in_progress'::text, 'done'::text, 'cancelled'::text, 'exception'::text]))), CONSTRAINT putaway_tasks_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT putaway_tasks_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL, CONSTRAINT putaway_tasks_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.grns(grn_id) ON DELETE CASCADE, CONSTRAINT putaway_tasks_grn_line_id_fkey FOREIGN KEY (grn_line_id) REFERENCES public.grn_lines(grn_line_id) ON DELETE CASCADE, CONSTRAINT putaway_tasks_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT putaway_tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT putaway_tasks_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL, CONSTRAINT putaway_tasks_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);
CREATE UNIQUE INDEX ux_putaway_tasks_task_id ON public.putaway_tasks USING btree (task_id);

-- Permissions

ALTER TABLE public.putaway_tasks OWNER TO postgres;
GRANT ALL ON TABLE public.putaway_tasks TO postgres;


-- public."returns" definition

-- Drop table

-- DROP TABLE public."returns";

CREATE TABLE public."returns" ( tenant_id text NOT NULL, return_id text DEFAULT 'RTN'::text || lpad(nextval('return_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, so_id text NULL, customer_id text NULL, status text DEFAULT 'initiated'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, cancelled_at timestamptz NULL, cancellation_reason text NULL, sku_id text NULL, qty numeric(18, 4) NULL, reason_code text NULL, reason_description text NULL, notes text NULL, updated_at timestamptz NULL, cancelled_by text NULL, cancellation_reason_code text NULL, received_at timestamptz NULL, closed_at timestamptz NULL, CONSTRAINT returns_pkey PRIMARY KEY (return_id), CONSTRAINT returns_status_check CHECK ((status = ANY (ARRAY['initiated'::text, 'awaiting_receipt'::text, 'received'::text, 'inspected'::text, 'closed'::text, 'cancelled'::text, 'created'::text, 'new'::text]))), CONSTRAINT returns_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT returns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT returns_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE SET NULL, CONSTRAINT returns_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE SET NULL, CONSTRAINT returns_so_id_fkey FOREIGN KEY (so_id) REFERENCES public.sales_orders(so_id) ON DELETE SET NULL, CONSTRAINT returns_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT returns_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public."returns" OWNER TO postgres;
GRANT ALL ON TABLE public."returns" TO postgres;


-- public.rma definition

-- Drop table

-- DROP TABLE public.rma;

CREATE TABLE public.rma ( rma_id text NOT NULL, tenant_id text NOT NULL, return_id text NULL, status text DEFAULT 'created'::text NOT NULL, notes text NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, updated_at timestamptz NULL, cancellation_reason text NULL, cancellation_reason_code text NULL, cancelled_by text NULL, cancelled_at timestamptz NULL, closed_at timestamptz NULL, CONSTRAINT rma_pkey PRIMARY KEY (rma_id), CONSTRAINT rma_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT rma_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT rma_return_id_fkey FOREIGN KEY (return_id) REFERENCES public."returns"(return_id) ON DELETE SET NULL, CONSTRAINT rma_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.rma OWNER TO postgres;
GRANT ALL ON TABLE public.rma TO postgres;


-- public.rma_items definition

-- Drop table

-- DROP TABLE public.rma_items;

CREATE TABLE public.rma_items ( rma_item_id text NOT NULL, tenant_id text NOT NULL, rma_id text NOT NULL, sku_id text NULL, qty numeric(18, 4) DEFAULT 0 NOT NULL, reason_code text NULL, CONSTRAINT rma_items_pkey PRIMARY KEY (rma_item_id), CONSTRAINT rma_items_rma_id_fkey FOREIGN KEY (rma_id) REFERENCES public.rma(rma_id) ON DELETE CASCADE, CONSTRAINT rma_items_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE SET NULL, CONSTRAINT rma_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.rma_items OWNER TO postgres;
GRANT ALL ON TABLE public.rma_items TO postgres;


-- public.rmas definition

-- Drop table

-- DROP TABLE public.rmas;

CREATE TABLE public.rmas ( tenant_id text NOT NULL, rma_id text DEFAULT 'RMA'::text || lpad(nextval('rma_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, return_id text NOT NULL, status text DEFAULT 'draft'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, created_by text NULL, cancelled_at timestamptz NULL, cancellation_reason text NULL, CONSTRAINT rmas_pkey PRIMARY KEY (rma_id), CONSTRAINT rmas_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'issued'::text, 'closed'::text, 'cancelled'::text]))), CONSTRAINT rmas_tenant_id_return_id_key UNIQUE (tenant_id, return_id), CONSTRAINT rmas_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT rmas_return_id_fkey FOREIGN KEY (return_id) REFERENCES public."returns"(return_id) ON DELETE CASCADE, CONSTRAINT rmas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT rmas_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.rmas OWNER TO postgres;
GRANT ALL ON TABLE public.rmas TO postgres;


-- public.sales_order_lines definition

-- Drop table

-- DROP TABLE public.sales_order_lines;

CREATE TABLE public.sales_order_lines ( tenant_id text NOT NULL, so_line_id text DEFAULT 'SOL'::text || lpad(nextval('so_line_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, so_id text NOT NULL, line_no int4 NOT NULL, sku_id text NOT NULL, ordered_qty numeric(18, 4) NOT NULL, allocated_qty numeric(18, 4) DEFAULT 0 NOT NULL, shipped_qty numeric(18, 4) DEFAULT 0 NOT NULL, uom text DEFAULT 'EA'::text NOT NULL, CONSTRAINT sales_order_lines_allocated_qty_check CHECK ((allocated_qty >= (0)::numeric)), CONSTRAINT sales_order_lines_ordered_qty_check CHECK ((ordered_qty >= (0)::numeric)), CONSTRAINT sales_order_lines_pkey PRIMARY KEY (so_line_id), CONSTRAINT sales_order_lines_shipped_qty_check CHECK ((shipped_qty >= (0)::numeric)), CONSTRAINT sales_order_lines_so_id_line_no_key UNIQUE (so_id, line_no), CONSTRAINT sales_order_lines_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT sales_order_lines_so_id_fkey FOREIGN KEY (so_id) REFERENCES public.sales_orders(so_id) ON DELETE CASCADE, CONSTRAINT sales_order_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.sales_order_lines OWNER TO postgres;
GRANT ALL ON TABLE public.sales_order_lines TO postgres;


-- public.count_entries definition

-- Drop table

-- DROP TABLE public.count_entries;

CREATE TABLE public.count_entries ( entry_id text NOT NULL, tenant_id text NOT NULL, count_id text NOT NULL, line_id text NULL, scan_mode text NULL, scanned_value text NULL, qty_counted numeric(18, 4) NULL, qty_delta numeric(18, 4) NULL, scanned_at timestamptz NULL, scanned_by text NULL, CONSTRAINT count_entries_pkey PRIMARY KEY (entry_id), CONSTRAINT count_entries_count_id_fkey FOREIGN KEY (count_id) REFERENCES public.count_plans(count_id) ON DELETE CASCADE, CONSTRAINT count_entries_line_id_fkey FOREIGN KEY (line_id) REFERENCES public.count_plan_lines(line_id) ON DELETE SET NULL, CONSTRAINT count_entries_scanned_by_fkey FOREIGN KEY (scanned_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT count_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.count_entries OWNER TO postgres;
GRANT ALL ON TABLE public.count_entries TO postgres;


-- public.pick_tasks definition

-- Drop table

-- DROP TABLE public.pick_tasks;

CREATE TABLE public.pick_tasks ( tenant_id text NOT NULL, pick_task_id text DEFAULT 'PCK'::text || lpad(nextval('pick_task_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, warehouse_id text NOT NULL, wave_id text NULL, so_id text NOT NULL, so_line_id text NOT NULL, sku_id text NOT NULL, from_location_id text NOT NULL, qty numeric(18, 4) NOT NULL, status text DEFAULT 'open'::text NOT NULL, assigned_to_user_id text NULL, started_at timestamptz NULL, completed_at timestamptz NULL, notes text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT pick_tasks_pkey PRIMARY KEY (pick_task_id), CONSTRAINT pick_tasks_qty_check CHECK ((qty >= (0)::numeric)), CONSTRAINT pick_tasks_status_check CHECK ((status = ANY (ARRAY['open'::text, 'assigned'::text, 'in_progress'::text, 'done'::text, 'exception'::text, 'cancelled'::text]))), CONSTRAINT pick_tasks_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT pick_tasks_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES public.locations(location_id) ON DELETE RESTRICT, CONSTRAINT pick_tasks_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT pick_tasks_so_id_fkey FOREIGN KEY (so_id) REFERENCES public.sales_orders(so_id) ON DELETE CASCADE, CONSTRAINT pick_tasks_so_line_id_fkey FOREIGN KEY (so_line_id) REFERENCES public.sales_order_lines(so_line_id) ON DELETE CASCADE, CONSTRAINT pick_tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT, CONSTRAINT pick_tasks_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id) ON DELETE RESTRICT, CONSTRAINT pick_tasks_wave_id_fkey FOREIGN KEY (wave_id) REFERENCES public.pick_waves(wave_id) ON DELETE SET NULL);

-- Permissions

ALTER TABLE public.pick_tasks OWNER TO postgres;
GRANT ALL ON TABLE public.pick_tasks TO postgres;


-- public.putaway_task_events definition

-- Drop table

-- DROP TABLE public.putaway_task_events;

CREATE TABLE public.putaway_task_events ( event_id text NOT NULL, tenant_id text NOT NULL, task_id text NOT NULL, event_type text NOT NULL, event_payload jsonb NULL, created_by text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT putaway_task_events_pkey PRIMARY KEY (event_id), CONSTRAINT putaway_task_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL, CONSTRAINT putaway_task_events_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.putaway_tasks(task_id) ON DELETE CASCADE, CONSTRAINT putaway_task_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.putaway_task_events OWNER TO postgres;
GRANT ALL ON TABLE public.putaway_task_events TO postgres;


-- public.return_items definition

-- Drop table

-- DROP TABLE public.return_items;

CREATE TABLE public.return_items ( tenant_id text NOT NULL, rmi_id text DEFAULT 'RMI'::text || lpad(nextval('rmi_id_seq'::regclass)::text, 6, '0'::text) NOT NULL, return_id text NOT NULL, sku_id text NOT NULL, qty numeric(18, 4) NOT NULL, reason text NULL, disposition text DEFAULT 'quarantine'::text NOT NULL, received_qty numeric(18, 4) DEFAULT 0 NOT NULL, notes text NULL, CONSTRAINT return_items_disposition_check CHECK ((disposition = ANY (ARRAY['restock'::text, 'quarantine'::text, 'scrap'::text, 'return_to_vendor'::text]))), CONSTRAINT return_items_pkey PRIMARY KEY (rmi_id), CONSTRAINT return_items_qty_check CHECK ((qty >= (0)::numeric)), CONSTRAINT return_items_received_qty_check CHECK ((received_qty >= (0)::numeric)), CONSTRAINT return_items_return_id_fkey FOREIGN KEY (return_id) REFERENCES public."returns"(return_id) ON DELETE CASCADE, CONSTRAINT return_items_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id) ON DELETE RESTRICT, CONSTRAINT return_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.return_items OWNER TO postgres;
GRANT ALL ON TABLE public.return_items TO postgres;