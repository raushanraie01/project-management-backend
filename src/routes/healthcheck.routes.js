import express from "express";
import { healthCheck } from "../controllers/healthCheck.controllers.js";
const router = express.Router();

router.route("/").get(healthCheck);

export default router;
