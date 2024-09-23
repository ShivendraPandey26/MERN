import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Comment from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(404).json({ Message: "Invalid video ID." });
  }

  try {
    const allComments = await Comment.find({ video: videoId })
      .populate("owner")
      .sort({ createdAt: -1 });

    if (!allComments) {
      return res
        .status(404)
        .json({ message: "No comments found for this video." });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, allComments, "Comments fetched successfully"));
  } catch (error) {
    // console.error("Error fetching comments for video:", error);
    return res
      .status(500)
      .json({ Error: "Failed to fetch comments due to server error" });
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { videoId } = req.params;
  const userId = req.user.id;

  // Validation: Ensure comment content and video ID are provided
  if (!comment || !videoId) {
    return res.status(400).json({
      Message: "Comment content and video ID are required for this video",
    });
  }

  try {
    // Create the new comment with owner information
    const newComment = await Comment.create({
      comment,
      video: videoId,
      owner: userId,
    });

    // Respond with success message and comment data
    return res
      .status(201)
      .json(new ApiResponse(201, newComment, "Comment created successfully"));
  } catch (error) {
    console.error("Error creating comment:", error); // Log the error for debugging

    return res
      .status(500)
      .json({
        Message: "Failed to create comment due to server error",
        Error: error,
      });
  }
});

const updateComment = asyncHandler(async (req, res) => {});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;
});

export { getVideoComments, addComment, updateComment, deleteComment };
