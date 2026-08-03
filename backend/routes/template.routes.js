import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  getTemplates,
  updateTemplate,
} from "../controller/templates.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createTemplate);
router.get("/", protectRoute, getTemplates);
router.get("/:id", protectRoute, getTemplate);
router.patch("/:id", protectRoute, updateTemplate);
router.delete("/:id", protectRoute, deleteTemplate);

export default router;
