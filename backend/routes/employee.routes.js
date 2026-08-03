import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from "../controller/employee.controller.js";

const router = express.Router();

router.post("/create-employee", protectRoute, createEmployee);
router.get("/", protectRoute, getEmployees);
router.get("/:id", protectRoute, getEmployee);
router.patch("/:id", protectRoute, updateEmployee);
router.delete("/:id", protectRoute, deleteEmployee);

export default router;
