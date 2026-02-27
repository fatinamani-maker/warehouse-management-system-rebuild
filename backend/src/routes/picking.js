import express from "express";
import { requireRole } from "../middlewares/auth.js";

const router = express.Router();

// ==============================
// STUB DATA
// ==============================
const pickLists = [
  {
    pick_list_id: "PCK000001",
    wave_id: "WAVE001",
    assigned_to_user_id: "USR00001",
    assigned_to_user_name: "Picker 1",
    status: "open",
    priority: "normal",
    lines_count: 3,
    warehouse_id: "WH001",
    tenantId: "TEN001",
    created_at: new Date().toISOString(),
  }
];

// ==============================
// LIST PICK LISTS
// ==============================
router.get("/pick-lists", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: pickLists
  });
});

// ==============================
// GET PICK LIST DETAIL
// ==============================
router.get("/pick-lists/:pickListId", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: {
      ...pickLists[0],
      pick_list_id: req.params.pickListId,
      lines: [
        {
          line_no: 1,
          sku_id: "ITEM001",
          location_id: "A1",
          qty_required: 10,
          qty_picked: 0,
          status: "open"
        }
      ]
    }
  });
});

// ==============================
// UPDATE PICK STATUS
// ==============================
router.post("/pick-lists/:pickListId/status", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Pick list ${req.params.pickListId} updated successfully`,
    status: req.body.status || "updated"
  });
});

// ==============================
// EXECUTE PICK (Stub)
// ==============================
router.post("/pick-lists/:pickListId/execute", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Pick list ${req.params.pickListId} executed successfully`
  });
});

// ==============================
// VERIFY ITEM (Stub)
// ==============================
router.post("/pick-lists/:pickListId/verify-item", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `Item verified for pick list ${req.params.pickListId}`
  });
});

export default router;