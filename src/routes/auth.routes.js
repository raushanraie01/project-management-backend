import express from "express";
import User from "../models/user.models.js";
import { registerUser, loginUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidation,
  userLoginValidation,
} from "../validators/index.js";

const router = express.Router();

router
  .route("/register")
  .post(userRegisterValidation(), validate, registerUser);

router.route("/login").post(userLoginValidation(), validate, loginUser);
export default router;
