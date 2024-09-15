import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// public video methods
const publishAVideo = asyncHandler(async (req, res) => {
  // Validate user input
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Accessing video file and thumbnail
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    return res
      .status(400)
      .json({ message: "Video and thumbnail file are required" });
  }

  let videoFile, thumbnailFile;

  try {
    // Upload video and thumbnail to Cloudinary
    videoFile = await uploadOnCloudinary(videoLocalPath);
    thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnailFile) {
      return res
        .status(400)
        .json({ message: "Failed to upload video and thumbnail" });
    }
  } catch (error) {
    // Handle any errors that occur during file upload or duration retrieval
    return res
      .status(500)
      .json({ message: error.message || "An error occurred" });
  }

  try {
    // Create a new video document in the database
    const video = await Video.create({
      title,
      description,
      videoFile: videoFile.url,
      thumbnail: thumbnailFile.url,
      owner: req.user.id,
      duration: videoFile.duration,
    });

    res
      .status(201)
      .json(new ApiResponse(201, video, "Video published successfully"));
  } catch (err) {
    console.error("Error saving video to the database:", err);
    res.status(500).json({ message: "Failed to save video to the database" });
  }
});

// get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "All Videos",
    data: "videos",
  });
});

export { publishAVideo, getAllVideos };
