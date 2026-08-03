import express from "express";
import {
  completeCampaign,
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaigns,
} from "../controller/campaign.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createCampaign);
router.get("/", protectRoute, getCampaigns);
router.get("/:id", protectRoute, getCampaign);
router.patch("/:id/complete", protectRoute, completeCampaign);
router.delete("/:id", protectRoute, deleteCampaign);

export default router;
