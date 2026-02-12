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

export { registerUser, loginUser };
