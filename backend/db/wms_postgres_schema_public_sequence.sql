-- public.adj_id_seq definition

-- DROP SEQUENCE public.adj_id_seq;

CREATE SEQUENCE public.adj_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.adj_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.adj_id_seq TO postgres;


-- public.adj_line_id_seq definition

-- DROP SEQUENCE public.adj_line_id_seq;

CREATE SEQUENCE public.adj_line_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.adj_line_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.adj_line_id_seq TO postgres;


-- public.asn_id_seq definition

-- DROP SEQUENCE public.asn_id_seq;

CREATE SEQUENCE public.asn_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.asn_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.asn_id_seq TO postgres;


-- public.asn_line_id_seq definition

-- DROP SEQUENCE public.asn_line_id_seq;

CREATE SEQUENCE public.asn_line_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.asn_line_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.asn_line_id_seq TO postgres;


-- public.audit_id_seq definition

-- DROP SEQUENCE public.audit_id_seq;

CREATE SEQUENCE public.audit_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.audit_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.audit_id_seq TO postgres;


-- public.cc_id_seq definition

-- DROP SEQUENCE public.cc_id_seq;

CREATE SEQUENCE public.cc_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.cc_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.cc_id_seq TO postgres;


-- public.ccl_id_seq definition

-- DROP SEQUENCE public.ccl_id_seq;

CREATE SEQUENCE public.ccl_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.ccl_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.ccl_id_seq TO postgres;


-- public.customer_id_seq definition

-- DROP SEQUENCE public.customer_id_seq;

CREATE SEQUENCE public.customer_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.customer_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.customer_id_seq TO postgres;


-- public.grn_id_seq definition

-- DROP SEQUENCE public.grn_id_seq;

CREATE SEQUENCE public.grn_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.grn_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.grn_id_seq TO postgres;


-- public.grn_line_id_seq definition

-- DROP SEQUENCE public.grn_line_id_seq;

CREATE SEQUENCE public.grn_line_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.grn_line_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.grn_line_id_seq TO postgres;


-- public.inv_balance_id_seq definition

-- DROP SEQUENCE public.inv_balance_id_seq;

CREATE SEQUENCE public.inv_balance_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.inv_balance_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.inv_balance_id_seq TO postgres;


-- public.itx_id_seq definition

-- DROP SEQUENCE public.itx_id_seq;

CREATE SEQUENCE public.itx_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.itx_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.itx_id_seq TO postgres;


-- public.location_id_seq definition

-- DROP SEQUENCE public.location_id_seq;

CREATE SEQUENCE public.location_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.location_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.location_id_seq TO postgres;


-- public.lov_group_seq definition

-- DROP SEQUENCE public.lov_group_seq;

CREATE SEQUENCE public.lov_group_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.lov_group_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.lov_group_seq TO postgres;


-- public.lov_value_seq definition

-- DROP SEQUENCE public.lov_value_seq;

CREATE SEQUENCE public.lov_value_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.lov_value_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.lov_value_seq TO postgres;


-- public.pack_task_id_seq definition

-- DROP SEQUENCE public.pack_task_id_seq;

CREATE SEQUENCE public.pack_task_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.pack_task_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.pack_task_id_seq TO postgres;


-- public.pick_task_id_seq definition

-- DROP SEQUENCE public.pick_task_id_seq;

CREATE SEQUENCE public.pick_task_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.pick_task_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.pick_task_id_seq TO postgres;


-- public.putaway_task_id_seq definition

-- DROP SEQUENCE public.putaway_task_id_seq;

CREATE SEQUENCE public.putaway_task_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.putaway_task_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.putaway_task_id_seq TO postgres;


-- public.return_id_seq definition

-- DROP SEQUENCE public.return_id_seq;

CREATE SEQUENCE public.return_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.return_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.return_id_seq TO postgres;


-- public.rma_id_seq definition

-- DROP SEQUENCE public.rma_id_seq;

CREATE SEQUENCE public.rma_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.rma_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.rma_id_seq TO postgres;


-- public.rmi_id_seq definition

-- DROP SEQUENCE public.rmi_id_seq;

CREATE SEQUENCE public.rmi_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.rmi_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.rmi_id_seq TO postgres;


-- public.shipment_id_seq definition

-- DROP SEQUENCE public.shipment_id_seq;

CREATE SEQUENCE public.shipment_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.shipment_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.shipment_id_seq TO postgres;


-- public.sku_id_seq definition

-- DROP SEQUENCE public.sku_id_seq;

CREATE SEQUENCE public.sku_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.sku_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.sku_id_seq TO postgres;


-- public.so_id_seq definition

-- DROP SEQUENCE public.so_id_seq;

CREATE SEQUENCE public.so_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.so_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.so_id_seq TO postgres;


-- public.so_line_id_seq definition

-- DROP SEQUENCE public.so_line_id_seq;

CREATE SEQUENCE public.so_line_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.so_line_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.so_line_id_seq TO postgres;


-- public.supplier_id_seq definition

-- DROP SEQUENCE public.supplier_id_seq;

CREATE SEQUENCE public.supplier_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.supplier_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.supplier_id_seq TO postgres;


-- public.tenant_id_seq definition

-- DROP SEQUENCE public.tenant_id_seq;

CREATE SEQUENCE public.tenant_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.tenant_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.tenant_id_seq TO postgres;


-- public.trace_event_seq definition

-- DROP SEQUENCE public.trace_event_seq;

CREATE SEQUENCE public.trace_event_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.trace_event_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.trace_event_seq TO postgres;


-- public.user_id_seq definition

-- DROP SEQUENCE public.user_id_seq;

CREATE SEQUENCE public.user_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.user_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.user_id_seq TO postgres;


-- public.warehouse_id_seq definition

-- DROP SEQUENCE public.warehouse_id_seq;

CREATE SEQUENCE public.warehouse_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.warehouse_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.warehouse_id_seq TO postgres;


-- public.wave_id_seq definition

-- DROP SEQUENCE public.wave_id_seq;

CREATE SEQUENCE public.wave_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.wave_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.wave_id_seq TO postgres;