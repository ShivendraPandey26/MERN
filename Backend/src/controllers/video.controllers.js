import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js";
import {
  uploadOnCloudinary,
  deleteCloudinaryImage,
  deleteCloudinaryVideo,
} from "../utils/cloudinary.js";
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

// get video by id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Fetch the video document from the database using the provided videoId
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video fetched successfully"));
  } catch (err) {
    // console.error("Error retrieving video from the database:", err);
    res.status(500).json({
      message:
        "Internal server error. Failed to retrieve video. or check your video ID ",
    });
  }
});

// video delete controller
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // delete video from cloudinary server
  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const deleteVideo = await deleteCloudinaryVideo(video.videoFile);
    const deletedThumbnail = await deleteCloudinaryImage(video.thumbnail);

    if (!deleteVideo || !deletedThumbnail) {
      return res.status(400).json({
        message: "Failed to delete video and thumbnail from Cloudinary",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete video from Cloudinary" });
  }

  // delete video from database
  try {
    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video deleted successfully"));
  } catch (error) {
    res.status(500).json({
      message:
        "Internal server error, Failed to delete video from the database",
    });
  }
});

// get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "All Videos",
    data: "videos",
  });
});

export { publishAVideo, getAllVideos, getVideoById, deleteVideo };
