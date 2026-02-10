-- Seed data for Warehouse Management System (PostgreSQL)
--
-- Applies to tables created/extended by migrations:
--   returns (extended), rma, rma_items,
--   putaway_task_events,
--   inventory_transactions, count_plans, count_plan_lines, count_entries,
--   adjustment_requests, trace_events
--
-- Multi-tenant: TNT000001, TNT000002
--
-- RLS NOTE:
-- If Row Level Security is enabled and your DB user is not BYPASSRLS,
-- set app.current_tenant_id before inserting into each tenant's rows.
-- This script uses SET row_security = off for convenience; remove it if you prefer strict RLS.

BEGIN;

-- Optional: bypass RLS during seeding (requires appropriate privileges)
SET LOCAL row_security = off;

-- -------------------------------------------------------------------
-- RETURNS (base table must exist; migration adds/changes columns)
-- -------------------------------------------------------------------
-- Expected columns (based on app usage + migration):
-- return_id (PK), tenant_id, warehouse_id, shipment_id, customer_id, customer_name,
-- sku_id, qty, reason_code, reason_description, notes, status,
-- created_at, created_by, updated_at,
-- cancellation_reason, cancellation_reason_code, cancelled_by, cancelled_at,
-- received_at, closed_at

INSERT INTO returns (
  return_id, tenant_id, warehouse_id, customer_id,
  sku_id, qty, reason_code, reason_description, notes, status,
  created_at, created_by, updated_at,
  cancellation_reason, cancellation_reason_code, cancelled_by, cancelled_at,
  received_at, closed_at
) VALUES
  ('RTN000001','TNT000001','WH000001','CUS000001',
   'SKU000002',1,'defective','Defective unit','Customer reported a defect during unpacking.','created',
   '2026-02-09T09:00:00Z','USR000003','2026-02-09T09:00:00Z',
   NULL,NULL,NULL,NULL,NULL,NULL),
  ('RTN000002','TNT000001','WH000001','CUS000002',
   'SKU000004',2,'wrong_item','Wrong item shipped','', 'new',
   '2026-02-09T10:30:00Z','USR000002','2026-02-09T10:30:00Z',
   NULL,NULL,NULL,NULL,NULL,NULL)
ON CONFLICT (return_id) DO NOTHING;

-- Keep rtn_id_seq in sync with seeded IDs (RTN000002 => 2)
SELECT setval('rtn_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(return_id,4)::INT),0) FROM returns WHERE return_id LIKE 'RTN%'), 2), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='rtn_id_seq');

-- -------------------------------------------------------------------
-- RMA + RMA_ITEMS (created in migration 20260209_001)
-- -------------------------------------------------------------------
INSERT INTO rma (
  rma_id, tenant_id, return_id, status, notes, created_at, created_by, updated_at,
  cancellation_reason, cancellation_reason_code, cancelled_by, cancelled_at, closed_at
) VALUES
  ('RMA000001','TNT000001','RTN000001','created','Initial RMA for defective return.',
   '2026-02-09T09:10:00Z','USR000003','2026-02-09T09:10:00Z',
   NULL,NULL,NULL,NULL,NULL)
ON CONFLICT (rma_id) DO NOTHING;

INSERT INTO rma_items (
  rma_item_id, tenant_id, rma_id, sku_id, qty, reason_code
) VALUES
  ('RMI000001','TNT000001','RMA000001','SKU000002',1,'defective')
ON CONFLICT (rma_item_id) DO NOTHING;

-- Keep sequences in sync
SELECT setval('rma_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(rma_id,4)::INT),0) FROM rma WHERE rma_id LIKE 'RMA%'), 1), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='rma_id_seq');

SELECT setval('rmi_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(rma_item_id,4)::INT),0) FROM rma_items WHERE rma_item_id LIKE 'RMI%'), 1), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='rmi_id_seq');

-- -------------------------------------------------------------------
-- PUTAWAY_TASK_EVENTS (created in migration 20260209_002)
-- Base table putaway_tasks must exist (events reference putaway_tasks(task_id)).
-- -------------------------------------------------------------------
INSERT INTO putaway_task_events (
  event_id, tenant_id, task_id, event_type, event_payload, created_by, created_at
) VALUES
  ('PUTEVT000001','TNT000001','PUT000210','created','{"status":"pending","suggested_bin":"A-01-001"}'::jsonb,'USR000003','2026-02-09T10:00:00Z'),
  ('PUTEVT000002','TNT000001','PUT000211','assigned','{"assigned_to_user_id":"USR000003","assigned_to_user_name":"Mike Operator"}'::jsonb,'USR000002','2026-02-09T10:06:00Z'),
  ('PUTEVT000003','TNT000001','PUT000211','started','{"started_at":"2026-02-09T10:05:00Z","device_type":"Android RFID","scan_method":"rfid"}'::jsonb,'USR000003','2026-02-09T10:10:00Z'),
  ('PUTEVT000004','TNT000001','PUT000212','completed','{"completed_at":"2026-02-08T14:15:00Z","validation_result":"passed","epc_expected_count":10,"epc_confirmed_count":10}'::jsonb,'USR000004','2026-02-08T14:15:00Z'),
  ('PUTEVT000005','TNT000001','PUT000213','exception','{"reason":"Count mismatch after verification"}'::jsonb,'USR000003','2026-02-09T11:40:00Z')
ON CONFLICT (event_id) DO NOTHING;

SELECT setval('putevt_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(event_id,7)::INT),0) FROM putaway_task_events WHERE event_id LIKE 'PUTEVT%'), 5), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='putevt_id_seq');

-- -------------------------------------------------------------------
-- INVENTORY_TRANSACTIONS (created in migration 20260209_003)
-- Note: migration table does NOT include warehouse_id; seed omits it.
-- -------------------------------------------------------------------
INSERT INTO inventory_transactions (
  txn_id, tenant_id, txn_type, sku_id, qty, uom_id,
  from_location_id, to_location_id, reference_type, reference_id, reason_code,
  created_at, created_by
) VALUES
  ('ITX000001','TNT000001','RECEIVE','SKU000001',1200,'EA',NULL,'LOC000001','GRN','GRN000143',NULL,'2026-02-08T08:00:00Z','USR000002'),
  ('ITX000002','TNT000001','RESERVE','SKU000001',150,'EA',NULL,'LOC000001','SO','SO000120',NULL,'2026-02-08T08:30:00Z','USR000002'),
  ('ITX000003','TNT000001','RECEIVE','SKU000002',35,'EA',NULL,'LOC000002','GRN','GRN000142',NULL,'2026-02-08T09:00:00Z','USR000003'),
  ('ITX000004','TNT000001','RESERVE','SKU000002',5,'EA',NULL,'LOC000002','SO','SO000121',NULL,'2026-02-08T09:15:00Z','USR000003'),
  ('ITX000005','TNT000001','RECEIVE','SKU000003',180,'EA',NULL,'LOC000003','GRN','GRN000144',NULL,'2026-02-08T09:30:00Z','USR000002'),
  ('ITX000006','TNT000001','RESERVE','SKU000003',20,'EA',NULL,'LOC000003','SO','SO000122',NULL,'2026-02-08T09:45:00Z','USR000002'),
  ('ITX000007','TNT000001','QUARANTINE_MOVE','SKU000003',10,'EA','LOC000003','LOC000006','MANUAL','MOVE000001','QUALITY_HOLD','2026-02-08T10:00:00Z','USR000002'),
  ('ITX000008','TNT000001','RECEIVE','SKU000004',450,'BOX',NULL,'LOC000001','GRN','GRN000143',NULL,'2026-02-08T10:30:00Z','USR000003'),
  ('ITX000009','TNT000001','RESERVE','SKU000004',100,'BOX',NULL,'LOC000001','SO','SO000123',NULL,'2026-02-08T10:45:00Z','USR000003'),
  ('ITX000010','TNT000001','RECEIVE','SKU000005',500,'PAIR',NULL,'LOC000006','MANUAL','INIT000001',NULL,'2026-02-08T11:00:00Z','USR000002'),
  ('ITX000011','TNT000002','RECEIVE','SKU900001',50,'EA',NULL,'LOC100001','GRN','GRN100001',NULL,'2026-02-08T08:00:00Z','USR100001')
ON CONFLICT (txn_id) DO NOTHING;

SELECT setval('itx_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(txn_id,4)::INT),0) FROM inventory_transactions WHERE txn_id LIKE 'ITX%'), 11), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='itx_id_seq');

-- -------------------------------------------------------------------
-- COUNT_PLANS / LINES / ENTRIES (created in migration 20260209_003)
-- -------------------------------------------------------------------
INSERT INTO count_plans (
  count_id, tenant_id, zone_id, planned_date, status,
  created_at, created_by, submitted_at, submitted_by, approved_at, approved_by, approval_note, cancellation_reason
) VALUES
  ('CC000014','TNT000001','ZN003','2026-02-07','APPROVED',
   '2026-02-07T08:00:00Z','USR000002','2026-02-07T09:00:00Z','USR000002','2026-02-07T09:30:00Z','USR000001','Approved within threshold',NULL),
  ('CC000015','TNT000001','ZN002','2026-02-09','IN_PROGRESS',
   '2026-02-09T08:30:00Z','USR000002',NULL,NULL,NULL,NULL,NULL,NULL)
ON CONFLICT (count_id) DO NOTHING;

INSERT INTO count_plan_lines (
  line_id, tenant_id, count_id, sku_id, location_id, system_qty, counted_qty, variance_qty, status
) VALUES
  ('CCL000001','TNT000001','CC000014','SKU000002','LOC000002',35,35,0,'PENDING'),
  ('CCL000002','TNT000001','CC000015','SKU000001','LOC000001',1200,1195,-5,'PENDING'),
  ('CCL000003','TNT000001','CC000015','SKU000004','LOC000001',450,NULL,NULL,'PENDING')
ON CONFLICT (line_id) DO NOTHING;

INSERT INTO count_entries (
  entry_id, tenant_id, count_id, line_id, scan_mode, scanned_value, qty_counted, qty_delta, scanned_at, scanned_by
) VALUES
  ('CCE000001','TNT000001','CC000015','CCL000002','MANUAL','SKU000001',1195,-5,'2026-02-09T10:00:00Z','USR000003')
ON CONFLICT (entry_id) DO NOTHING;

SELECT setval('cc_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(count_id,3)::INT),0) FROM count_plans WHERE count_id LIKE 'CC%'), 15), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='cc_id_seq');

SELECT setval('ccl_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(line_id,4)::INT),0) FROM count_plan_lines WHERE line_id LIKE 'CCL%'), 3), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='ccl_id_seq');

SELECT setval('cce_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(entry_id,4)::INT),0) FROM count_entries WHERE entry_id LIKE 'CCE%'), 1), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='cce_id_seq');

-- -------------------------------------------------------------------
-- ADJUSTMENT_REQUESTS (created in migration 20260209_003)
-- -------------------------------------------------------------------
INSERT INTO adjustment_requests (
  adj_id, tenant_id, status, sku_id, location_id, qty_delta, reason_code,
  requested_by, requested_at, approved_by, approved_at, approval_note, cancellation_reason
) VALUES
  ('ADJ000005','TNT000001','APPROVED','SKU000005','LOC000006',500,'QUALITY_HOLD',
   'USR000002','2026-02-07T10:00:00Z','USR000001','2026-02-07T10:10:00Z','Approved quality hold stock',NULL),
  ('ADJ000006','TNT000001','SUBMITTED','SKU000003','LOC000003',-3,'DAMAGED',
   'USR000003','2026-02-09T12:00:00Z',NULL,NULL,NULL,NULL)
ON CONFLICT (adj_id) DO NOTHING;

SELECT setval('adj_id_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING(adj_id,4)::INT),0) FROM adjustment_requests WHERE adj_id LIKE 'ADJ%'), 6), true)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='adj_id_seq');

-- -------------------------------------------------------------------
-- TRACE_EVENTS (created in migration 20260210_004)
-- -------------------------------------------------------------------
INSERT INTO trace_events (
  tenant_id, trace_event_id, event_at, event_type, status,
  warehouse_id, warehouse_name, process,
  location_id, location_code, location_path,
  actor_type, actor_id, actor_name,
  device_code, system_code,
  sku_code, epc, ref_type, ref_no
) VALUES
  ('TNT000001','TRC000000001','2026-02-09T09:30:00Z','RECEIVE','received',
   'WH000001','Main Distribution Center','inbound',
   NULL,'DOCK-1','WH000001/DOCK-1',
   'user','USR000003','Mike Operator',
   'ANDROID-QR-01','WMS',
   'SKU000001','EPC:300833B2DDD9014000000001','GRN','GRN000143'),
  ('TNT000001','TRC000000002','2026-02-09T10:30:00Z','PUTAWAY','completed',
   'WH000001','Main Distribution Center','putaway',
   'LOC000001','A-01-001','WH000001/ZN002/A-01-001',
   'device',NULL,'HANDHELD-RFID-01',
   'HANDHELD-RFID-01','WMS',
   'SKU000001','EPC:300833B2DDD9014000000001','PUT','PUT000210'),
  ('TNT000001','TRC000000003','2026-02-09T11:30:00Z','PICK','picked',
   'WH000001','Main Distribution Center','outbound',
   'LOC000001','A-01-001','WH000001/ZN002/A-01-001',
   'user','USR000003','Mike Operator',
   'ANDROID-QR-01','WMS',
   'SKU000001','EPC:300833B2DDD9014000000001','DO','DO000077'),
  ('TNT000002','TRC000000004','2026-02-09T09:15:00Z','RECEIVE','received',
   'WH000003','Tenant2 Distribution Center','inbound',
   NULL,'DOCK-1','WH000003/DOCK-1',
   'user','USR100001','Tenant2 Manager',
   'ANDROID-QR-02','WMS',
   'SKU900001','EPC:300833B2DDD9014000090001','GRN','GRN100001')
ON CONFLICT (trace_event_id) DO NOTHING;

-- Keep trace sequence in sync (TRC000000004 => 4)
SELECT setval('trace_event_seq',
  GREATEST((SELECT COALESCE(MAX(SUBSTRING(trace_event_id,4)::BIGINT),0) FROM trace_events WHERE trace_event_id LIKE 'TRC%'), 4),
  true
)
WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname='trace_event_seq');

COMMIT;
