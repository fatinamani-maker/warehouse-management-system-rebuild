import express from "express";

const router = express.Router();

// =============================
// GET ALL LOV (with pagination)
// =============================
router.get("/", (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const lovList = [
    {
      id: "LOV000001",
      code: "USER_ROLE",
      value: "superadmin",
      description: "Super Administrator",
      tenantId: "TEN001",
      status: "ACTIVE"
    },
    {
      id: "LOV000002",
      code: "USER_ROLE",
      value: "storemanager",
      description: "Store Manager",
      tenantId: "TEN001",
      status: "ACTIVE"
    }
  ];

  res.json({
    success: true,
    data: lovList,
    meta: {
      pagination: {
        page: Number(page),
        pageSize: Number(limit),
        total: lovList.length,
        totalPages: 1
      }
    }
  });
});

// =============================
// GET LOV BY ID
// =============================
router.get("/:id", (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      code: "USER_ROLE",
      value: "superadmin",
      description: "Super Administrator",
      tenantId: "TEN001",
      status: "ACTIVE"
    }
  });
});

// =============================
// CREATE LOV
// =============================
router.post("/", (req, res) => {
  const { code, value, description } = req.body;

  res.json({
    success: true,
    message: "LOV created successfully",
    data: {
      id: "LOV000003",
      code,
      value,
      description,
      tenantId: "TEN001",
      status: "ACTIVE"
    }
  });
});

// =============================
// UPDATE LOV
// =============================
router.put("/:id", (req, res) => {
  res.json({
    success: true,
    message: "LOV updated successfully",
    data: {
      id: req.params.id,
      ...req.body
    }
  });
});

// =============================
// DELETE LOV
// =============================
router.delete("/:id", (req, res) => {
  res.json({
    success: true,
    message: `LOV ${req.params.id} deleted successfully`
  });
});

export default router;