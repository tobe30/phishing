import express from "express";
import {
  getCampaignReport,
  getReports,
} from "../controller/report.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getReports);
router.get("/campaign/:id", protectRoute, getCampaignReport);

export default router;
