import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { upload } from "../middleware/multer.middlewares.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
