-- public.v_dashboard_kpis source

CREATE OR REPLACE VIEW public.v_dashboard_kpis
AS WITH ctx AS (
         SELECT current_setting('app.tenant_id'::text, true) AS tenant_id,
            current_setting('app.warehouse_id'::text, true) AS warehouse_id
        ), today_inbound AS (
         SELECT a.tenant_id,
            a.warehouse_id,
            count(*) AS inbound_asn_due
           FROM asns a
          WHERE a.eta = CURRENT_DATE
          GROUP BY a.tenant_id, a.warehouse_id
        ), today_grn AS (
         SELECT g_1.tenant_id,
            g_1.warehouse_id,
            count(*) AS grn_today
           FROM grns g_1
          WHERE g_1.received_date = CURRENT_DATE
          GROUP BY g_1.tenant_id, g_1.warehouse_id
        ), today_ship AS (
         SELECT sh.tenant_id,
            sh.warehouse_id,
            count(*) AS shipments_today
           FROM shipments sh
          WHERE sh.ship_date = CURRENT_DATE
          GROUP BY sh.tenant_id, sh.warehouse_id
        ), low_stock AS (
         SELECT v_inventory_low_stock.tenant_id,
            v_inventory_low_stock.warehouse_id,
            count(*) AS low_stock_skus
           FROM v_inventory_low_stock
          GROUP BY v_inventory_low_stock.tenant_id, v_inventory_low_stock.warehouse_id
        )
 SELECT COALESCE(c.tenant_id, t.tenant_id) AS tenant_id,
    COALESCE(c.warehouse_id, t.warehouse_id) AS warehouse_id,
    COALESCE(t.inbound_asn_due, 0::bigint) AS inbound_asn_due_today,
    COALESCE(g.grn_today, 0::bigint) AS grns_received_today,
    COALESCE(p.putaway_open, 0::bigint) AS putaway_open,
    COALESCE(o.pick_open, 0::bigint) AS picks_open,
    COALESCE(s.shipments_today, 0::bigint) AS shipments_today,
    COALESCE(ls.low_stock_skus, 0::bigint) AS low_stock_skus
   FROM ctx c
     LEFT JOIN today_inbound t ON t.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR t.warehouse_id = c.warehouse_id)
     LEFT JOIN today_grn g ON g.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR g.warehouse_id = c.warehouse_id)
     LEFT JOIN v_putaway_workload p ON p.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR p.warehouse_id = c.warehouse_id)
     LEFT JOIN v_outbound_workload o ON o.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR o.warehouse_id = c.warehouse_id)
     LEFT JOIN today_ship s ON s.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR s.warehouse_id = c.warehouse_id)
     LEFT JOIN low_stock ls ON ls.tenant_id = c.tenant_id AND (c.warehouse_id IS NULL OR ls.warehouse_id = c.warehouse_id);

-- Permissions

ALTER TABLE public.v_dashboard_kpis OWNER TO postgres;
GRANT ALL ON TABLE public.v_dashboard_kpis TO postgres;


-- public.v_inbound_summary source

CREATE OR REPLACE VIEW public.v_inbound_summary
AS SELECT tenant_id,
    warehouse_id,
    count(*) FILTER (WHERE status = ANY (ARRAY['pending'::text, 'in_transit'::text, 'arrived'::text, 'receiving'::text])) AS asn_open,
    count(*) FILTER (WHERE status = 'completed'::text) AS asn_completed
   FROM asns
  GROUP BY tenant_id, warehouse_id;

-- Permissions

ALTER TABLE public.v_inbound_summary OWNER TO postgres;
GRANT ALL ON TABLE public.v_inbound_summary TO postgres;


-- public.v_inventory_low_stock source

CREATE OR REPLACE VIEW public.v_inventory_low_stock
AS SELECT b.tenant_id,
    b.warehouse_id,
    b.sku_id,
    s.description AS sku_description,
    sum(b.qty_on_hand - b.qty_reserved - b.qty_quarantine) AS available_qty,
    s.reorder_point,
    s.reorder_qty
   FROM inventory_balances b
     JOIN skus s ON s.sku_id = b.sku_id
  GROUP BY b.tenant_id, b.warehouse_id, b.sku_id, s.description, s.reorder_point, s.reorder_qty
 HAVING sum(b.qty_on_hand - b.qty_reserved - b.qty_quarantine) <= s.reorder_point;

-- Permissions

ALTER TABLE public.v_inventory_low_stock OWNER TO postgres;
GRANT ALL ON TABLE public.v_inventory_low_stock TO postgres;


-- public.v_outbound_workload source

CREATE OR REPLACE VIEW public.v_outbound_workload
AS SELECT tenant_id,
    warehouse_id,
    count(*) FILTER (WHERE status = ANY (ARRAY['open'::text, 'assigned'::text, 'in_progress'::text, 'exception'::text])) AS pick_open,
    count(*) FILTER (WHERE status = 'done'::text) AS pick_done
   FROM pick_tasks
  GROUP BY tenant_id, warehouse_id;

-- Permissions

ALTER TABLE public.v_outbound_workload OWNER TO postgres;
GRANT ALL ON TABLE public.v_outbound_workload TO postgres;


-- public.v_putaway_workload source

CREATE OR REPLACE VIEW public.v_putaway_workload
AS SELECT tenant_id,
    warehouse_id,
    count(*) FILTER (WHERE status = ANY (ARRAY['open'::text, 'assigned'::text, 'in_progress'::text, 'exception'::text])) AS putaway_open,
    count(*) FILTER (WHERE status = 'done'::text) AS putaway_done
   FROM putaway_tasks
  GROUP BY tenant_id, warehouse_id;

-- Permissions

ALTER TABLE public.v_putaway_workload OWNER TO postgres;
GRANT ALL ON TABLE public.v_putaway_workload TO postgres;


-- public.v_trace_timeline source

CREATE OR REPLACE VIEW public.v_trace_timeline
AS SELECT e.tenant_id,
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

-- Permissions

ALTER TABLE public.v_trace_timeline OWNER TO postgres;
GRANT ALL ON TABLE public.v_trace_timeline TO postgres;