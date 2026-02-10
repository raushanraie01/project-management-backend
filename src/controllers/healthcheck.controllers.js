import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/async-Handler.js";

const healthCheck = asyncHandler((req, res, next) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is running..." }));
});
export { healthCheck };
