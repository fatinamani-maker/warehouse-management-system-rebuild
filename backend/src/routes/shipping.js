import express from "express";
import { requireRole } from "../middlewares/auth.js";

const router = express.Router();

// ==============================
// STUB DATA
// ==============================
const shipments = [
  {
    shipment_id: "SHP000001",
    order_no: "ORD000001",
    carrier: "DHL",
    status: "ready",
    tenantId: "TEN001",
    created_at: new Date().toISOString(),
  }
];

// ==============================
// LIST SHIPMENTS
// ==============================
router.get(
  "/",
  requireRole(["superadmin", "hqadmin", "storemanager"]),
  (req, res) => {
    res.json({
      success: true,
      data: shipments,
      meta: {
        page: 1,
        pageSize: 10,
        total: shipments.length,
      },
    });
  }
);

export default router;