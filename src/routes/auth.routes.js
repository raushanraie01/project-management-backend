import express from "express";
import User from "../models/user.models.js";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidation } from "../validators/index.js";

const router = express.Router();

router
  .route("/register")
  .post(userRegisterValidation(), validate, registerUser);

export default router;
