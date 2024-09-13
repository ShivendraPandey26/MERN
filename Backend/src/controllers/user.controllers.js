import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteCloudinaryImage,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// generate Access Token and refresh token
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(
      "Error generating access and refresh tokens: ",
      error.message
    );
  }
};

// Register new user
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Ensure all required fields are present and non-empty
  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Case-insensitive search for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return res
      .status(409)
      .json({ Message: "User with this username already exists" });
  }

  // Handle avatar upload
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    return res.status(400).json({ message: "Avatar file is required" });
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    return res.status(400).json({ message: "Avatar file is required" });
  }

  // Create user in the database, using default cover image if none was uploaded
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Fetch the newly created user (exclude sensitive fields)
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res
      .status(500)
      .json({ message: "Something went wrong while registering the user" });
  }

  // Send response with the newly created user
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login existing user
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Ensure all required fields are present and non-empty
  if (!username && !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// Logout existing user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// Refresh user's access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    // Respond with an unauthorized status if the refresh token is missing
    return res
      .status(401)
      .json({ error: "Unauthorized request: Refresh token missing" });
  }

  try {
    // Verify the incoming refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user by the decoded token's ID
    const user = await User.findById(decodedToken?.id);

    if (!user || incomingRefreshToken !== user?.refreshToken) {
      // Respond with an error if the token is invalid or expired
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true, // Use secure flag for HTTPS
      sameSite: "Strict", // Prevent CSRF attacks
    };

    // Set the cookies and respond with the new tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        status: 200,
        message: "Access token refreshed successfully",
        data: { accessToken, refreshToken: newRefreshToken },
      });
  } catch (error) {
    // Catch any errors and respond with an appropriate status and message
    return res
      .status(401)
      .json({ error: "Unauthorized request, invalid refresh token" });
  }
});

// change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  if (!oldpassword || !newpassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(req.user.id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Incorrect old password" });
  }

  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Current password changed successfully"));
});

//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// update user details
const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

// update User Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    return res.status(400).json({ message: "Avatar file is missing" });
  }

  // delete previous avatar
  const previousAvatar = await User.findById(req.user.id);

  if (previousAvatar?.avatar) {
    const isDeleted = await deleteCloudinaryImage(previousAvatar.avatar);
    if (isDeleted) {
      console.log("Previous avatar deleted successfully");
    } else {
      console.log("Failed to delete previous avatar");
    }
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    return res.status(400).json({ message: "Error while uploading on avatar" });
  }

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

// update User Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const coverImage = user.coverImage;

  if (coverImage) {
    // delete previous cover image

    if (coverImage) {
      const isDeleted = await deleteCloudinaryImage(coverImage);
      if (isDeleted) {
        console.log("Previous cover image deleted successfully");
      } else {
        console.log("Failed to delete previous cover image");
      }
    }
  }

  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    return res.status(400).json({ message: "Cover image file is missing" });
  }

  const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!uploadedCoverImage) {
    return res
      .status(400)
      .json({ message: "Error while uploading on cover image" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        coverImage: uploadedCoverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User cover image updated successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
