import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/async-Handler.js";
import sendMail from "../utils/sendVerificationMail.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mailgen.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    let accessToken = user.generateAccessToken();
    let refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something is wrong while generating the access or refresh token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists ", []);
  }

  const user = await User.create({
    email,
    username,
    password,
    isEmailVerified: false,
  });

  const { refreshToken, accessToken } = generateAccessAndRefreshToken(user._id);

  const { unHashedToken, hashToken, tokenExpiry } = user.generateRandomToken();

  user.emailVerificationExpiry = tokenExpiry;
  user.emailVerificationToken = hashToken;
  await user.save({ validateBeforeSave: false });

  //sending verification email
  let verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`;

  sendMail({
    email: user?.email,
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      verificationUrl,
    ),
    subject: "Please verify your email ",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //validate
  if (!email || !password) {
    throw new ApiError(400, "Enter all Credentials");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  // check password
  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) {
    throw new ApiError(400, "Invalid Credentials");
  }

  //generating random and access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken: accessToken },
        "User loggedIn Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req?.user;
  if (!user) throw new ApiError(404, "Need to Login First");

  await User.findByIdAndUpdate(
    user._id,
    { $set: { refreshToken: "" } },
    { new: true },
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedOut successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
  const user = req?.user;
  if (!user) throw new ApiError(404, "Need to Login First");

  res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "fetching user details successfully  "),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  let verificationToken = req.params;
  if (!verificationToken)
    throw new ApiError(400, "Email verification token is missing");

  //this token is unhashed and hashed token is save in db, compare it after encrypt
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(
      400,
      "Time Expired or token is invalid, try again later...",
    );
  }

  user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "Need to Logged In first");

  if (user.isEmailVerified)
    throw new ApiError(409, "User Email already verified");

  const { unHashedToken, hashToken, tokenExpiry } = user.generateRandomToken();

  user.emailVerificationExpiry = tokenExpiry;
  user.emailVerificationToken = hashToken;
  await user.save({ validateBeforeSave: false });

  //sending verification email
  let verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`;

  sendMail({
    email: user?.email,
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      verificationUrl,
    ),
    subject: "Please verify your email ",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your emailID"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Access");

  try {
    const decodedData = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedData._id).select("refreshToken");
    if (!user) throw new ApiError(401, "Invalid RefreshToken");

    if (incomingRefreshToken !== user.refreshToken)
      throw new ApiError(401, "Refresh Token is expired");

    const options = { httpOnly: true, secure: true };

    const { accessToken, refreshToken: NewRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    user.refreshToken = NewRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", NewRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: NewRefreshToken },
          "New AccessToken generated",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
  verifyEmail,
  resendEmailVerification,
};
