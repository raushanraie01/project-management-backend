import express from "express";
import User from "../models/user.models.js";
import { registerUser } from "../controllers/auth.controllers.js";

const router = express.Router();

router.route("/register").post(registerUser);

export default router;
