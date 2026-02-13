import express from "express";
import User from "../models/user.models.js";
import { registerUser, loginUser } from "../controllers/auth.controllers.js";
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

router.get("/hello", verifyJwt, (req, res) => res.send("hello user"));
export default router;
