import express from "express";
import User from "../models/user.models.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidation,
  userLoginValidation,
} from "../validators/index.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/register")
  .post(userRegisterValidation(), validate, registerUser);

router.route("/login").post(userLoginValidation(), validate, loginUser);

//protected Routes
router.post("/logout", verifyJwt, logoutUser);
router.post("/user", verifyJwt, currentUser);
router.post("/verify-email", verifyJwt, verifyEmail);

export default router;
