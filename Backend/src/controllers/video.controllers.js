import { asyncHandler } from "../utils/asyncHandler.js";

// public video methods
const publishAVideo = asyncHandler(async (req, res) => {});

// get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "All Videos",
    data: "videos",
  });
});

export { publishAVideo, getAllVideos };
