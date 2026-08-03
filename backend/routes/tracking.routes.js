import express from "express";
import {
  trackClick,
  trackOpen,
  trackReport,
  trackSubmission,
} from "../controller/tracking.controller.js";

const router = express.Router();

router.get("/:trackingToken/open", trackOpen);
router.get("/:trackingToken/click", trackClick);
router.post("/:trackingToken/submit", trackSubmission);
router.post("/:trackingToken/report", trackReport);

export default router;
