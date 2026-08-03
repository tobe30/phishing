import express from "express";
import { completeTraining } from "../controller/training.controller.js";

const router = express.Router();

router.post("/:trackingToken/complete", completeTraining);

export default router;
