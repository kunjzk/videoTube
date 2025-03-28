import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { upload } from "../middleware/multer.middlewares.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(user);
    if (!user) {
      throw new ApiError(500, "User not found, cannot generate refresh token");
    }
    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating user and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  let avatar;
  let coverImage;
  try {
    const { fullname, email, username, password } = req.body;

    // validation
    if (
      [fullname, email, username, password].some((field) => field?.trim() == "")
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      throw new ApiError(409, "User with email or username already exists");
    }

    console.warn(req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    // if (!avatarLocalPath) {
    //   throw new ApiError(400, "Avatar file is missing");
    // }
    // const avatar = await uploadOnCloudinary(avatarLocalPath);

    try {
      avatar = await uploadOnCloudinary(avatarLocalPath);
      console.log("Uploaded avatar", avatar);
    } catch (error) {
      console.log("Error uploding avatar", error);
      throw new ApiError(500, "Failed to upload avatar");
    }

    try {
      coverImage = await uploadOnCloudinary(coverLocalPath);
      console.log("Uploaded cover image", coverImage);
    } catch (error) {
      console.log("Error uploding cover image", error);
      throw new ApiError(500, "Failed to upload cover image");
    }

    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering a user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User Registered Successfully"));
  } catch (error) {
    console.log("User Creation Failed");

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering a user. Cloudinary images were deleted."
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from body
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new ApiError(400, "Email, username and password fields are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // validate password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; // body contains token on mobile
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpsOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refresh successfully"
        )
      );
  } catch (error) {}
});

export { registerUser, loginUser, refreshAccessToken, logoutUser };
