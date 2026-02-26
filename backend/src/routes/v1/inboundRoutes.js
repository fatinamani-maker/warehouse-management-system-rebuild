import express from "express";
import { requireRole } from "../../middlewares/auth.js";

const router = express.Router();

// ==============================
// STUB DATA
// ==============================
const inboundStub = [
  {
    id: "ASN000001",
    type: "asn",
    tenantId: "TEN001",
    status: "CREATED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "GRN000001",
    type: "grn",
    tenantId: "TEN001",
    status: "RECEIVED",
    createdAt: new Date().toISOString(),
  }
];

// ==============================
// ASN CRUD
// ==============================

router.get("/asn", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: inboundStub.filter(i => i.type === "asn")
  });
});

router.get("/asn/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      type: "asn",
      tenantId: "TEN001",
      status: "CREATED"
    }
  });
});

router.post("/asn", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: "ASN created successfully",
    data: {
      id: "ASN000002",
      ...req.body,
      tenantId: "TEN001",
      status: "CREATED"
    }
  });
});

router.put("/asn/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: "ASN updated successfully",
    data: {
      id: req.params.id,
      ...req.body
    }
  });
});

router.delete("/asn/:id", requireRole(["superadmin", "hqadmin"]), (req, res) => {
  res.json({
    success: true,
    message: `ASN ${req.params.id} deleted successfully`
  });
});

// ==============================
// GRN CRUD
// ==============================

router.get("/grn", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: inboundStub.filter(i => i.type === "grn")
  });
});

router.get("/grn/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      type: "grn",
      tenantId: "TEN001",
      status: "RECEIVED"
    }
  });
});

router.post("/grn", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: "GRN created successfully",
    data: {
      id: "GRN000002",
      ...req.body,
      tenantId: "TEN001",
      status: "RECEIVED"
    }
  });
});

router.put("/grn/:id", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: "GRN updated successfully",
    data: {
      id: req.params.id,
      ...req.body
    }
  });
});

router.delete("/grn/:id", requireRole(["superadmin", "hqadmin"]), (req, res) => {
  res.json({
    success: true,
    message: `GRN ${req.params.id} deleted successfully`
  });
});

// ==============================
// PROGRESS & CANCEL
// ==============================

router.post("/asn/:id/progress", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `ASN ${req.params.id} progressed successfully`
  });
});

router.post("/grn/:id/progress", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `GRN ${req.params.id} progressed successfully`
  });
});

router.post("/asn/:id/cancel", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `ASN ${req.params.id} cancelled successfully`
  });
});

router.post("/grn/:id/cancel", requireRole(["superadmin", "hqadmin", "storemanager"]), (req, res) => {
  res.json({
    success: true,
    message: `GRN ${req.params.id} cancelled successfully`
  });
});

export default router;