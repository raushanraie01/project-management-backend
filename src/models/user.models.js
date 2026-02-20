import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; //  Node.js module
import { ApiError } from "../utils/apiErrors.js";

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      default: "https://placehold.co/200X200",
    },
    username: {
      type: String,
      required: true,
      unique: true, //no need to index : true , unique:true is already create index: true
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    forgotPasswordToken: { type: String },
    forgotPasswordExpiry: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: Date },
  },
  {
    timestamps: true,
  },
);

//hashing password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

//generate random token to verify email and reset password
userSchema.methods.generateRandomToken = function () {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  //hash it
  const hashToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 15 * 60 * 1000; //15 min from now
  return { unHashedToken, hashToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);

export default User;
