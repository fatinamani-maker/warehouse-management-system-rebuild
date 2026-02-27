import express from "express";
import { requireRole } from "../middlewares/auth.js";

const router = express.Router();

// ==============================
// STUB DATA
// ==============================
const packOrders = [
  {
    pack_id: "PAK000001",
    pick_list_id: "PCK000001",
    carton_id: "CTN000001",
    packaging_type: "BOX",
    weight_kg: 2.5,
    status: "CREATED",
    tenantId: "TEN001",
    created_at: new Date().toISOString(),
  }
];

// ==============================
// LIST PACK ORDERS
// ==============================
router.get("/orders", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: packOrders
  });
});

// ==============================
// GET PACK ORDER DETAIL
// ==============================
router.get("/orders/:packId", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: {
      ...packOrders[0],
      pack_id: req.params.packId,
      lines: [
        {
          line_no: 1,
          sku_id: "ITEM001",
          qty: 5
        }
      ]
    }
  });
});

// ==============================
// LIST PACKAGING OPTIONS
// ==============================
router.get("/options", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    packaging_types: ["BOX", "PALLET", "ENVELOPE"]
  });
});

// ==============================
// CREATE CARTON
// ==============================
router.post("/orders/:packId/create-carton", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Carton created for pack order ${req.params.packId}`,
    data: {
      carton_id: "CTN000002"
    }
  });
});

// ==============================
// GENERATE LABEL
// ==============================
router.post("/orders/:packId/generate-label", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Label generated for pack order ${req.params.packId}`
  });
});

// ==============================
// CONFIRM PACK
// ==============================
router.post("/orders/:packId/confirm-pack", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Pack order ${req.params.packId} confirmed as PACKED`
  });
});

export default router;