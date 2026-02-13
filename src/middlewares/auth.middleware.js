import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/async-Handler.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized access");
  }
  try {
    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedData) {
      throw new ApiError(401, "Invalid Token");
    }

    const user = await User.findById(decodedData._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) throw new ApiError(401, "Inauthorized request");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid token ! , Unauthorized Access");
  }
});
