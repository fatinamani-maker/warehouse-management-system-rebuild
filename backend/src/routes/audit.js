import express from "express";
import { listAuditLogs } from "../data/store.js";

const router = express.Router();

router.get("/logs", (req, res) => {
  return res.json(listAuditLogs(req.tenant_id));
});

export default router;
