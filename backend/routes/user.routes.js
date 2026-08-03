import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/settings", protectRoute, getSettings);
router.patch("/settings", protectRoute, updateSettings);

export default router;
