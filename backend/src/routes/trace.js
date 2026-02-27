import express from "express";
import { requireRole } from "../middlewares/auth.js";

const router = express.Router();

// ==============================
// STUB DATA
// ==============================
const traceEvents = [
  {
    event_id: "EVT000001",
    reference: "ASN000001",
    type: "asn",
    description: "ASN created",
    timestamp: new Date().toISOString(),
    tenantId: "TEN001",
  },
  {
    event_id: "EVT000002",
    reference: "PCK000001",
    type: "picking",
    description: "Picking started",
    timestamp: new Date().toISOString(),
    tenantId: "TEN001",
  }
];

// ==============================
// TRACE EVENTS
// ==============================
router.get(
  "/events",
  requireRole(["superadmin", "hqadmin", "storemanager"]),
  (req, res) => {
    res.json({
      success: true,
      data: traceEvents,
      meta: {
        page: 1,
        pageSize: 20,
        total: traceEvents.length,
      },
    });
  }
);

// ==============================
// TRACE SEARCH
// ==============================
router.get(
  "/search",
  requireRole(["superadmin", "hqadmin", "storemanager"]),
  (req, res) => {
    res.json({
      success: true,
      items: traceEvents,
      total: traceEvents.length,
      page: 1,
      pageSize: 20,
    });
  }
);

export default router;