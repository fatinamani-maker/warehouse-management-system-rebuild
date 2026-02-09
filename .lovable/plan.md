

# Warehouse Management System (WMS) — Full UI/UX Mockup

## Overview
A complete, clickable multi-tenant WMS prototype with SKU traceability via QR/RFID scanning. All data is mock/hardcoded. Professional enterprise design with a fully light theme, clean dense tables, and strong scan-workflow affordances.

---

## 1. Global Layout & Navigation

**Left Sidebar** — Collapsible with icons + labels:
- Dashboard, Inbound, Putaway, Inventory, Picking, Packing, Shipping, Returns, Trace (QR/RF), Master Data, Users & Roles, LOV Maintenance, Audit Log, Settings

**Top Bar:**
- Tenant switcher (dropdown with confirmation on switch if unsaved changes)
- Warehouse selector
- Global search (SKU, GRN, Pick List, EPC, Location)
- Notifications bell
- User menu (profile, session info, logout)
- Current tenant + warehouse always visible

---

## 2. Authentication Flow

- **Sign In** page (Clerk-style UI with email/password, masked password)
- **Sign Up** and **Forgot Password** screens
- **Post-login: Select Tenant** screen (if user belongs to multiple tenants)
- **Select Warehouse** screen
- **Session Info Panel** (read-only): user, roles, tenant_id, warehouse_id, token expiry indicator

---

## 3. Dashboard

- **KPI Cards**: Today's inbound, pending putaway, stock accuracy %, open picks, overdue shipments, exceptions count
- **Charts**: Inbound vs Outbound trend, inventory aging, top movers (using Recharts)
- **Widgets**: Quick Scan (QR/RF) launcher, Recent Activities feed, Alerts panel

---

## 4. Trace (QR/RF) — ⭐ Star Feature

### Tab 1: Scan & Trace
- **Left panel — Scan Console**:
  - Mode toggle: QR / RFID
  - Input method selector: Camera / Reader / Manual
  - Large input field with placeholder
  - Start Scan, Stop, Submit buttons
  - "Simulate Scan" dropdown with sample test codes
- **Right panel — Trace Result**:
  - SKU card (ID like SKU000001, description, UOM, lot/serial, status badge)
  - Current Location (Zone/Aisle/Bin, warehouse)
  - Last Movement summary
  - Movement Timeline (chronological stepper)
  - Related Documents list (GRN, Putaway, Pick, Pack, Ship, Return — clickable links)
  - Exceptions panel (mismatch, duplicate tag, unknown tag, cross-tenant attempt)
  - Actions: Create Exception Ticket, Move to Quarantine, Print Label

### Tab 2: History Search
- Filters: SKU ID, EPC/Tag ID, QR value, lot, date range, doc type, location, user
- Results table with drill-down to trace detail

---

## 5. Inbound Module
- ASN (Advanced Shipment Notice) list + create form
- Goods Receipt (GRN) — create with line items, status workflow (Draft → Receiving → Completed → Posted)
- Receiving screen with scan-enabled fields (QR/RF) and discrepancy handling
- Dock appointment placeholder

---

## 6. Putaway Module
- Task list (priority, aging indicators)
- Task detail: source dock, suggested bins, scan confirm source + destination, partial putaway

---

## 7. Inventory Module
- Stock on Hand table with multi-level filters (tenant/warehouse/zone/bin/category)
- Stock card detail: balances, reserved, available, quarantine
- **Cycle Count**: plan creation, count execution with scanning, variance review + approval flow
- Inventory adjustments with approval

---

## 8. Picking Module
- Wave planning screen
- Pick lists table
- Pick execution (mobile-friendly web panel): next pick suggestion → scan bin → scan item → confirm qty, short pick reasons

---

## 9. Packing Module
- Pack station: scan pick list → scan items to verify → select packaging (LOV-driven) → generate carton label

---

## 10. Shipping Module
- Shipment creation + list
- Dispatch screen: scan cartons, carrier selection (LOV-driven), proof of dispatch mock upload

---

## 11. Returns Module
- RMA creation form
- Receive return with scanning
- Disposition options: restock / quarantine / scrap

---

## 12. Master Data
- **SKU Master** (IDs like SKU000001): details, barcode/QR rules, RFID tag association, reorder params, dimensions, hazardous flags
- **Locations** (Zone/Aisle/Rack/Bin hierarchy)
- **Warehouses**, **Suppliers**, **Customers**
- **UOM**, **Categories**

---

## 13. Users & Roles (RBAC)
- Users list with invite functionality
- Tenant + warehouse scope assignment per user
- Roles list (superadmin, hqadmin, storemanager, warehouseclerk, auditor)
- Role-permission matrix UI
- "View as role" access preview

---

## 14. LOV Maintenance
- LOV groups (packaging_types, carriers, adjustment_reasons, exception_types, uom, zones)
- CRUD with custom confirmation modal for deletes
- Last updated metadata
- Where-used viewer

---

## 15. Audit Log
- Searchable trail: who/what/when/tenant/warehouse/entity/action
- Export button (mock)
- PII masking note displayed

---

## 16. Settings
- **Tenant Settings**: profile, default warehouse
- **Security Settings**: password policy display, session timeout, MFA note
- **Integrations**: RFID reader config, QR scanner guidance
- **Dev Notes Panel**: ".env only" guidance for sensitive info

---

## 17. Shared UI Components & Patterns
- Reusable **Scan-Enabled Field** component (used across Receiving, Putaway, Picking, Returns, Trace)
- Unified **Data Table** with column picker, filters, pagination
- **Custom Confirmation Modal** (no browser alerts) for all delete/destructive actions
- Empty states, loading skeletons, error states
- Toast notifications for actions
- Breadcrumbs on all pages
- Status badges and workflow steppers
- Form validation UX patterns
- Cross-tenant **Access Denied** page

---

## 18. Mock Data Conventions
- All IDs use prefix+padding+sequence: SKU000001, GRN000143, PUT000210, etc.
- RFID shows EPC format (EPC:3008...)
- QR payloads represent SKU or document references
- Roles use lowercase IDs

---

## 19. Multi-Tenant UX Guardrails
- Tenant + warehouse always visible in header
- Cross-tenant access shows Access Denied page
- Tenant switch requires confirmation if unsaved changes exist

