// ===== TENANTS & WAREHOUSES =====
export const tenants = [
  { id: "TNT000001", name: "Acme Corp", status: "active" },
  { id: "TNT000002", name: "GlobalTrade Inc", status: "active" },
  { id: "TNT000003", name: "MegaStore Ltd", status: "active" },
];

export const warehouses = [
  { id: "WH000001", name: "Main Distribution Center", tenantId: "TNT000001", city: "Chicago", country: "US" },
  { id: "WH000002", name: "East Hub", tenantId: "TNT000001", city: "New York", country: "US" },
  { id: "WH000003", name: "West Fulfillment", tenantId: "TNT000002", city: "Los Angeles", country: "US" },
];

// ===== USERS & ROLES =====
export const roles = [
  { id: "superadmin", name: "Super Admin", description: "Full system access across tenants" },
  { id: "hqadmin", name: "HQ Admin", description: "Tenant-level admin" },
  { id: "storemanager", name: "Store Manager", description: "Warehouse-level management" },
  { id: "warehouseclerk", name: "Warehouse Clerk", description: "Operational tasks" },
  { id: "auditor", name: "Auditor", description: "Read-only audit access" },
];

export const permissions = [
  "dashboard.view", "inbound.view", "inbound.create", "inbound.edit", "inbound.delete",
  "putaway.view", "putaway.execute", "inventory.view", "inventory.adjust", "inventory.count",
  "picking.view", "picking.execute", "packing.view", "packing.execute",
  "shipping.view", "shipping.dispatch", "returns.view", "returns.process",
  "trace.view", "trace.scan", "masterdata.view", "masterdata.edit",
  "users.view", "users.manage", "lov.view", "lov.manage",
  "audit.view", "settings.view", "settings.manage",
];

export const rolePermissions: Record<string, string[]> = {
  superadmin: permissions,
  hqadmin: permissions.filter(p => !p.startsWith("settings.manage")),
  storemanager: permissions.filter(p => !p.includes("users.manage") && !p.includes("settings")),
  warehouseclerk: permissions.filter(p => p.includes("view") || p.includes("execute") || p.includes("scan")),
  auditor: permissions.filter(p => p.includes("view")),
};

export const users = [
  { id: "USR000001", name: "John Admin", email: "john@acme.com", role: "superadmin", tenants: ["TNT000001", "TNT000002"], warehouses: ["WH000001", "WH000002"], status: "active", lastLogin: "2026-02-09T08:30:00Z" },
  { id: "USR000002", name: "Sarah Manager", email: "sarah@acme.com", role: "storemanager", tenants: ["TNT000001"], warehouses: ["WH000001"], status: "active", lastLogin: "2026-02-09T09:15:00Z" },
  { id: "USR000003", name: "Mike Clerk", email: "mike@acme.com", role: "warehouseclerk", tenants: ["TNT000001"], warehouses: ["WH000001"], status: "active", lastLogin: "2026-02-08T14:00:00Z" },
  { id: "USR000004", name: "Lisa Auditor", email: "lisa@globaltrade.com", role: "auditor", tenants: ["TNT000002"], warehouses: ["WH000003"], status: "active", lastLogin: "2026-02-07T10:00:00Z" },
  { id: "USR000005", name: "Tom HQ", email: "tom@acme.com", role: "hqadmin", tenants: ["TNT000001"], warehouses: ["WH000001", "WH000002"], status: "inactive", lastLogin: "2026-01-20T16:00:00Z" },
];

// ===== LOCATIONS =====
export const zones = [
  { id: "ZN001", name: "Receiving Dock", warehouseId: "WH000001", type: "dock" },
  { id: "ZN002", name: "Bulk Storage A", warehouseId: "WH000001", type: "storage" },
  { id: "ZN003", name: "Pick Area B", warehouseId: "WH000001", type: "picking" },
  { id: "ZN004", name: "Packing Station", warehouseId: "WH000001", type: "packing" },
  { id: "ZN005", name: "Shipping Dock", warehouseId: "WH000001", type: "dock" },
  { id: "ZN006", name: "Quarantine", warehouseId: "WH000001", type: "quarantine" },
];

export const locations = [
  { id: "LOC000001", zone: "ZN002", aisle: "A", rack: "01", bin: "001", warehouseId: "WH000001", label: "A-01-001" },
  { id: "LOC000002", zone: "ZN002", aisle: "A", rack: "01", bin: "002", warehouseId: "WH000001", label: "A-01-002" },
  { id: "LOC000003", zone: "ZN002", aisle: "B", rack: "02", bin: "001", warehouseId: "WH000001", label: "B-02-001" },
  { id: "LOC000004", zone: "ZN003", aisle: "C", rack: "01", bin: "001", warehouseId: "WH000001", label: "C-01-001" },
  { id: "LOC000005", zone: "ZN001", aisle: "-", rack: "-", bin: "DOCK-1", warehouseId: "WH000001", label: "DOCK-1" },
  { id: "LOC000006", zone: "ZN006", aisle: "Q", rack: "01", bin: "001", warehouseId: "WH000001", label: "Q-01-001" },
];

// ===== SKU MASTER =====
export const skus = [
  { id: "SKU000001", description: "Industrial Bearing 6205", uom: "EA", category: "Bearings", lot: "LOT2026A", serial: null, weight: 0.12, dimensions: "25x52x15mm", hazardous: false, reorderPoint: 500, reorderQty: 1000, status: "active", qrPayload: "QR:SKU000001:LOT2026A", rfidEpc: "EPC:300833B2DDD9014000000001" },
  { id: "SKU000002", description: "Hydraulic Pump HP-200", uom: "EA", category: "Pumps", lot: "LOT2026B", serial: "SN-HP200-0042", weight: 15.5, dimensions: "400x300x250mm", hazardous: false, reorderPoint: 20, reorderQty: 50, status: "active", qrPayload: "QR:SKU000002:SN-HP200-0042", rfidEpc: "EPC:300833B2DDD9014000000002" },
  { id: "SKU000003", description: "Lithium Battery Pack LB-12", uom: "EA", category: "Electronics", lot: "LOT2026C", serial: "SN-LB12-0118", weight: 2.3, dimensions: "200x150x80mm", hazardous: true, reorderPoint: 100, reorderQty: 200, status: "active", qrPayload: "QR:SKU000003:SN-LB12-0118", rfidEpc: "EPC:300833B2DDD9014000000003" },
  { id: "SKU000004", description: "Steel Fastener M10x50", uom: "BOX", category: "Fasteners", lot: "LOT2025Z", serial: null, weight: 5.0, dimensions: "300x200x100mm", hazardous: false, reorderPoint: 200, reorderQty: 500, status: "active", qrPayload: "QR:SKU000004:LOT2025Z", rfidEpc: "EPC:300833B2DDD9014000000004" },
  { id: "SKU000005", description: "Safety Gloves SG-XL", uom: "PAIR", category: "Safety", lot: null, serial: null, weight: 0.15, dimensions: "30x15x5cm", hazardous: false, reorderPoint: 1000, reorderQty: 2000, status: "quarantine", qrPayload: "QR:SKU000005", rfidEpc: "EPC:300833B2DDD9014000000005" },
];

// ===== INVENTORY / STOCK =====
export const stockOnHand = [
  { skuId: "SKU000001", locationId: "LOC000001", qty: 1200, reserved: 150, available: 1050, quarantine: 0 },
  { skuId: "SKU000002", locationId: "LOC000002", qty: 35, reserved: 5, available: 30, quarantine: 0 },
  { skuId: "SKU000003", locationId: "LOC000003", qty: 180, reserved: 20, available: 150, quarantine: 10 },
  { skuId: "SKU000004", locationId: "LOC000001", qty: 450, reserved: 100, available: 350, quarantine: 0 },
  { skuId: "SKU000005", locationId: "LOC000006", qty: 500, reserved: 0, available: 0, quarantine: 500 },
];

// ===== INBOUND: ASN & GRN =====
export const asns = [
  { id: "ASN000001", supplierId: "SUP000001", supplierName: "Parts Global", eta: "2026-02-10", status: "pending", lines: 3, tenantId: "TNT000001", warehouseId: "WH000001" },
  { id: "ASN000002", supplierId: "SUP000002", supplierName: "TechSupply Co", eta: "2026-02-11", status: "in_transit", lines: 2, tenantId: "TNT000001", warehouseId: "WH000001" },
];

export const grns = [
  { id: "GRN000143", asnId: "ASN000001", receivedDate: "2026-02-09", status: "receiving", receivedBy: "USR000003", tenantId: "TNT000001", warehouseId: "WH000001", lines: [
    { skuId: "SKU000001", expected: 500, received: 480, discrepancy: -20, status: "partial" },
    { skuId: "SKU000004", expected: 200, received: 200, discrepancy: 0, status: "complete" },
  ]},
  { id: "GRN000142", asnId: null, receivedDate: "2026-02-08", status: "posted", receivedBy: "USR000002", tenantId: "TNT000001", warehouseId: "WH000001", lines: [
    { skuId: "SKU000002", expected: 10, received: 10, discrepancy: 0, status: "complete" },
  ]},
];

// ===== PUTAWAY =====
export const putawayTasks = [
  { id: "PUT000210", grnId: "GRN000143", skuId: "SKU000001", qty: 480, sourceLocation: "DOCK-1", suggestedBin: "A-01-001", actualBin: null, status: "pending", priority: "high", createdAt: "2026-02-09T10:00:00Z", assignedTo: "USR000003" },
  { id: "PUT000211", grnId: "GRN000143", skuId: "SKU000004", qty: 200, sourceLocation: "DOCK-1", suggestedBin: "A-01-002", actualBin: null, status: "pending", priority: "medium", createdAt: "2026-02-09T10:05:00Z", assignedTo: "USR000003" },
  { id: "PUT000209", grnId: "GRN000142", skuId: "SKU000002", qty: 10, sourceLocation: "DOCK-1", suggestedBin: "B-02-001", actualBin: "B-02-001", status: "completed", priority: "low", createdAt: "2026-02-08T14:00:00Z", assignedTo: "USR000003" },
];

// ===== PICKING =====
export const pickLists = [
  { id: "PCK000077", waveId: "WAV000012", status: "in_progress", assignedTo: "USR000003", createdAt: "2026-02-09T11:00:00Z", lines: [
    { skuId: "SKU000001", locationId: "LOC000001", qtyRequired: 50, qtyPicked: 30, status: "picking" },
    { skuId: "SKU000004", locationId: "LOC000001", qtyRequired: 20, qtyPicked: 0, status: "pending" },
  ]},
  { id: "PCK000076", waveId: "WAV000011", status: "completed", assignedTo: "USR000003", createdAt: "2026-02-08T09:00:00Z", lines: [
    { skuId: "SKU000002", locationId: "LOC000002", qtyRequired: 5, qtyPicked: 5, status: "picked" },
  ]},
];

// ===== PACKING =====
export const packOrders = [
  { id: "PAK000033", pickListId: "PCK000076", status: "packed", cartonId: "CTN000091", packaging: "Standard Box", weight: 78.5, packedBy: "USR000003", packedAt: "2026-02-08T15:00:00Z" },
];

// ===== SHIPPING =====
export const shipments = [
  { id: "SHP000031", packIds: ["PAK000033"], carrier: "FedEx Ground", trackingNo: "FX123456789", status: "dispatched", dispatchedAt: "2026-02-08T17:00:00Z", customerId: "CUS000001", customerName: "RetailMax" },
  { id: "SHP000030", packIds: [], carrier: "UPS Standard", trackingNo: null, status: "pending", dispatchedAt: null, customerId: "CUS000002", customerName: "BuildRight Co" },
];

// ===== RETURNS =====
export const returns = [
  { id: "RMA000009", shipmentId: "SHP000031", customerId: "CUS000001", customerName: "RetailMax", reason: "Defective unit", status: "received", disposition: "quarantine", skuId: "SKU000002", qty: 1, receivedAt: "2026-02-09T09:00:00Z" },
];

// ===== SUPPLIERS & CUSTOMERS =====
export const suppliers = [
  { id: "SUP000001", name: "Parts Global", contact: "supplier@partsglobal.com", country: "US" },
  { id: "SUP000002", name: "TechSupply Co", contact: "orders@techsupply.com", country: "CN" },
];

export const customers = [
  { id: "CUS000001", name: "RetailMax", contact: "orders@retailmax.com", country: "US" },
  { id: "CUS000002", name: "BuildRight Co", contact: "purchasing@buildright.com", country: "CA" },
];

// ===== TRACE / MOVEMENT HISTORY =====
export const movementHistory = [
  { id: "MOV000001", skuId: "SKU000001", type: "receive", from: "External", to: "DOCK-1", qty: 500, docRef: "GRN000143", timestamp: "2026-02-09T09:30:00Z", user: "USR000003", scanMethod: "qr" },
  { id: "MOV000002", skuId: "SKU000001", type: "putaway", from: "DOCK-1", to: "A-01-001", qty: 480, docRef: "PUT000210", timestamp: "2026-02-09T10:30:00Z", user: "USR000003", scanMethod: "rfid" },
  { id: "MOV000003", skuId: "SKU000001", type: "pick", from: "A-01-001", to: "Pick Cart", qty: 50, docRef: "PCK000077", timestamp: "2026-02-09T11:30:00Z", user: "USR000003", scanMethod: "qr" },
  { id: "MOV000004", skuId: "SKU000002", type: "receive", from: "External", to: "DOCK-1", qty: 10, docRef: "GRN000142", timestamp: "2026-02-08T13:00:00Z", user: "USR000002", scanMethod: "rfid" },
  { id: "MOV000005", skuId: "SKU000002", type: "putaway", from: "DOCK-1", to: "B-02-001", qty: 10, docRef: "PUT000209", timestamp: "2026-02-08T14:30:00Z", user: "USR000003", scanMethod: "rfid" },
  { id: "MOV000006", skuId: "SKU000002", type: "pick", from: "B-02-001", to: "Pick Cart", qty: 5, docRef: "PCK000076", timestamp: "2026-02-08T15:00:00Z", user: "USR000003", scanMethod: "qr" },
  { id: "MOV000007", skuId: "SKU000002", type: "pack", from: "Pick Cart", to: "Pack Station", qty: 5, docRef: "PAK000033", timestamp: "2026-02-08T15:30:00Z", user: "USR000003", scanMethod: "qr" },
  { id: "MOV000008", skuId: "SKU000002", type: "ship", from: "Pack Station", to: "Customer", qty: 5, docRef: "SHP000031", timestamp: "2026-02-08T17:00:00Z", user: "USR000002", scanMethod: "qr" },
  { id: "MOV000009", skuId: "SKU000002", type: "return", from: "Customer", to: "DOCK-1", qty: 1, docRef: "RMA000009", timestamp: "2026-02-09T09:00:00Z", user: "USR000003", scanMethod: "qr" },
  { id: "MOV000010", skuId: "SKU000005", type: "quarantine", from: "A-01-001", to: "Q-01-001", qty: 500, docRef: "ADJ000005", timestamp: "2026-02-07T10:00:00Z", user: "USR000002", scanMethod: "rfid" },
];

export const traceExceptions = [
  { id: "EXC000001", skuId: "SKU000001", type: "quantity_mismatch", description: "Expected 500, received 480 — 20 units short", docRef: "GRN000143", status: "open", createdAt: "2026-02-09T09:35:00Z" },
  { id: "EXC000002", skuId: "SKU000005", type: "quality_hold", description: "Batch failed QC inspection — moved to quarantine", docRef: "ADJ000005", status: "under_review", createdAt: "2026-02-07T10:05:00Z" },
  { id: "EXC000003", skuId: "SKU000003", type: "duplicate_tag", description: "Duplicate RFID EPC detected during putaway scan", docRef: "PUT000208", status: "resolved", createdAt: "2026-02-06T14:00:00Z" },
];

// ===== SIMULATE SCAN CODES =====
export const simulateScanCodes = [
  { label: "SKU000001 (Bearing) — QR", value: "QR:SKU000001:LOT2026A", mode: "qr" as const },
  { label: "SKU000002 (Pump) — QR", value: "QR:SKU000002:SN-HP200-0042", mode: "qr" as const },
  { label: "SKU000003 (Battery) — RFID", value: "EPC:300833B2DDD9014000000003", mode: "rfid" as const },
  { label: "SKU000005 (Gloves, Quarantine) — RFID", value: "EPC:300833B2DDD9014000000005", mode: "rfid" as const },
  { label: "Unknown Tag", value: "EPC:UNKNOWN000000000000", mode: "rfid" as const },
  { label: "GRN000143 — QR", value: "QR:GRN000143", mode: "qr" as const },
];

// ===== LOV (List of Values) =====
export const lovGroups = [
  { id: "packaging_types", name: "Packaging Types", values: ["Standard Box", "Pallet Wrap", "Bubble Wrap", "Crate", "Envelope"], usedIn: ["Packing", "Shipping"], lastUpdated: "2026-01-15" },
  { id: "carriers", name: "Carriers", values: ["FedEx Ground", "UPS Standard", "DHL Express", "USPS Priority", "FreightLine"], usedIn: ["Shipping"], lastUpdated: "2026-01-20" },
  { id: "adjustment_reasons", name: "Adjustment Reasons", values: ["Damaged", "Expired", "Miscounted", "Theft", "System Error"], usedIn: ["Inventory"], lastUpdated: "2026-02-01" },
  { id: "exception_types", name: "Exception Types", values: ["quantity_mismatch", "quality_hold", "duplicate_tag", "unknown_tag", "cross_tenant"], usedIn: ["Trace", "Inbound"], lastUpdated: "2026-02-05" },
  { id: "uom", name: "Units of Measure", values: ["EA", "BOX", "PAIR", "KG", "LTR", "PLT"], usedIn: ["Master Data", "Inbound"], lastUpdated: "2025-12-10" },
  { id: "zones", name: "Zone Types", values: ["dock", "storage", "picking", "packing", "quarantine", "staging"], usedIn: ["Master Data", "Inventory"], lastUpdated: "2026-01-08" },
];

// ===== AUDIT LOG =====
export const auditLog = [
  { id: "AUD000001", timestamp: "2026-02-09T10:30:00Z", user: "USR000003", userName: "Mike Clerk", action: "create", entity: "GRN", entityId: "GRN000143", tenantId: "TNT000001", warehouseId: "WH000001", details: "Created goods receipt for ASN000001" },
  { id: "AUD000002", timestamp: "2026-02-09T10:35:00Z", user: "USR000003", userName: "Mike Clerk", action: "scan", entity: "SKU", entityId: "SKU000001", tenantId: "TNT000001", warehouseId: "WH000001", details: "QR scan during receiving" },
  { id: "AUD000003", timestamp: "2026-02-09T11:00:00Z", user: "USR000003", userName: "Mike Clerk", action: "update", entity: "Putaway", entityId: "PUT000210", tenantId: "TNT000001", warehouseId: "WH000001", details: "Putaway task confirmed" },
  { id: "AUD000004", timestamp: "2026-02-08T17:00:00Z", user: "USR000002", userName: "Sarah Manager", action: "dispatch", entity: "Shipment", entityId: "SHP000031", tenantId: "TNT000001", warehouseId: "WH000001", details: "Shipment dispatched via FedEx Ground" },
  { id: "AUD000005", timestamp: "2026-02-07T10:00:00Z", user: "USR000002", userName: "Sarah Manager", action: "adjust", entity: "Inventory", entityId: "SKU000005", tenantId: "TNT000001", warehouseId: "WH000001", details: "Moved 500 units to quarantine" },
];

// ===== CYCLE COUNTS =====
export const cycleCounts = [
  { id: "CC000015", zone: "ZN002", status: "in_progress", plannedDate: "2026-02-09", countedBy: "USR000003", lines: [
    { skuId: "SKU000001", locationId: "LOC000001", systemQty: 1200, countedQty: 1195, variance: -5, status: "counted" },
    { skuId: "SKU000004", locationId: "LOC000001", systemQty: 450, countedQty: null, variance: null, status: "pending" },
  ]},
  { id: "CC000014", zone: "ZN003", status: "approved", plannedDate: "2026-02-07", countedBy: "USR000003", lines: [
    { skuId: "SKU000002", locationId: "LOC000002", systemQty: 35, countedQty: 35, variance: 0, status: "approved" },
  ]},
];

// ===== DASHBOARD KPIs =====
export const dashboardKPIs = {
  todayInbound: 3,
  pendingPutaway: 2,
  stockAccuracy: 99.6,
  openPicks: 1,
  overdueShipments: 1,
  exceptionsCount: 2,
};

export const chartData = {
  inboundOutbound: [
    { date: "Feb 03", inbound: 12, outbound: 8 },
    { date: "Feb 04", inbound: 8, outbound: 15 },
    { date: "Feb 05", inbound: 15, outbound: 10 },
    { date: "Feb 06", inbound: 6, outbound: 12 },
    { date: "Feb 07", inbound: 10, outbound: 9 },
    { date: "Feb 08", inbound: 14, outbound: 11 },
    { date: "Feb 09", inbound: 3, outbound: 5 },
  ],
  inventoryAging: [
    { range: "0-30 days", count: 2500 },
    { range: "31-60 days", count: 800 },
    { range: "61-90 days", count: 300 },
    { range: "90+ days", count: 150 },
  ],
  topMovers: [
    { sku: "SKU000001", description: "Industrial Bearing", movements: 45 },
    { sku: "SKU000004", description: "Steel Fastener", movements: 32 },
    { sku: "SKU000002", description: "Hydraulic Pump", movements: 18 },
    { sku: "SKU000003", description: "Lithium Battery", movements: 12 },
    { sku: "SKU000005", description: "Safety Gloves", movements: 5 },
  ],
};

export const recentActivities = [
  { time: "10:35 AM", action: "QR Scan", detail: "SKU000001 scanned at receiving dock", user: "Mike Clerk" },
  { time: "10:30 AM", action: "GRN Created", detail: "GRN000143 for ASN000001", user: "Mike Clerk" },
  { time: "09:15 AM", action: "Login", detail: "Sarah Manager signed in", user: "Sarah Manager" },
  { time: "09:00 AM", action: "Return Received", detail: "RMA000009 — 1x SKU000002", user: "Mike Clerk" },
  { time: "Yesterday", action: "Dispatch", detail: "SHP000031 shipped via FedEx", user: "Sarah Manager" },
];

export const alerts = [
  { type: "warning", message: "SKU000005 in quarantine — 500 units held" },
  { type: "error", message: "SHP000030 overdue — no dispatch yet" },
  { type: "info", message: "Cycle count CC000015 in progress — Zone A" },
];
