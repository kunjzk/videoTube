import { jwt } from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = AsyncHandler(async (req, _, next) => {
  const token =
    req.cookies.accessToken ||
    req.body.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
  req.user = user;
  next();
});

export { verifyJWT };
