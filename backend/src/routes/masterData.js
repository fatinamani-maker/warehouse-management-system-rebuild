import express from "express";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  listAsns,
  listGrns,
  listSuppliers,
  updateSupplier,
} from "../data/store.js";

const router = express.Router();

router.get("/suppliers", (req, res) => {
  const tenantId = req.tenant_id;
  const suppliers = listSuppliers(tenantId).map((item) => ({
    supplier_id: item.supplier_id,
    supplier_name: item.supplier_name,
    is_active: item.is_active,
  }));

  return res.json(suppliers);
});

router.post("/suppliers", (req, res) => {
  const tenantId = req.tenant_id;
  const supplierName = String(req.body?.supplier_name || "").trim();
  const isActive = req.body?.is_active === undefined ? true : Boolean(req.body?.is_active);

  if (!supplierName) {
    return res.status(400).json({ message: "supplier_name is required" });
  }

  const created = createSupplier(tenantId, supplierName, isActive);
  return res.status(201).json(created);
});

router.put("/suppliers/:supplier_id", (req, res) => {
  const tenantId = req.tenant_id;
  const supplierId = req.params.supplier_id;

  const existing = getSupplier(tenantId, supplierId);
  if (!existing) {
    return res.status(404).json({ message: "Supplier not found" });
  }

  const supplierName = req.body?.supplier_name;
  if (supplierName !== undefined && !String(supplierName).trim()) {
    return res.status(400).json({ message: "supplier_name cannot be empty" });
  }

  const updated = updateSupplier(tenantId, supplierId, {
    supplier_name: supplierName === undefined ? undefined : String(supplierName).trim(),
    is_active: req.body?.is_active,
  });

  return res.json(updated);
});

router.delete("/suppliers/:supplier_id", (req, res) => {
  const tenantId = req.tenant_id;
  const supplierId = req.params.supplier_id;

  const relatedAsn = listAsns(tenantId).some((item) => item.supplier_id === supplierId);
  const relatedGrn = listGrns(tenantId).some((item) => item.supplier_id === supplierId);

  if (relatedAsn || relatedGrn) {
    return res.status(409).json({
      message: "Supplier is referenced by inbound documents. Deactivate instead of deleting.",
    });
  }

  const deleted = deleteSupplier(tenantId, supplierId);
  if (!deleted) {
    return res.status(404).json({ message: "Supplier not found" });
  }

  return res.status(204).send();
});

export default router;
