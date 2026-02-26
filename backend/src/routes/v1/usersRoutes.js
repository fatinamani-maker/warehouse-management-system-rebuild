import express from "express";

const router = express.Router();

// GET USERS
router.get("/", (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const users = [
    {
      id: "USR00001",
      name: "Super Admin",
      email: "admin@tenant1.com",
      roleId: "superadmin",
      tenantId: "TEN001",
      status: "ACTIVE"
    }
  ];

  res.json({
    success: true,
    data: users,
    meta: {
      pagination: {
        page: Number(page),
        pageSize: Number(limit),
        total: users.length,
        totalPages: 1
      }
    }
  });
});

// GET USER BY ID
router.get("/:id", (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: "Super Admin",
      email: "admin@tenant1.com",
      roleId: "superadmin",
      tenantId: "TEN001",
      status: "ACTIVE"
    }
  });
});

// CREATE USER
router.post("/", (req, res) => {
  const { name, email, roleId } = req.body;

  res.json({
    success: true,
    message: "User created successfully",
    data: {
      id: "USR00002",
      name,
      email,
      roleId: roleId?.toLowerCase(),
      tenantId: "TEN001",
      status: "ACTIVE"
    }
  });
});

// UPDATE USER
router.put("/:id", (req, res) => {
  res.json({
    success: true,
    message: "User updated successfully",
    data: {
      id: req.params.id,
      ...req.body
    }
  });
});

// DELETE USER
router.delete("/:id", (req, res) => {
  res.json({
    success: true,
    message: `User ${req.params.id} deleted successfully`
  });
});

export default router;