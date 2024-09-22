import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Comment from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const { videoId } = req.params;
    const userId = req.user.id;
  
    // Validation: Ensure comment content and video ID are provided
    if (!comment) {
      return res
        .status(400)
        .json(ApiResponse.error("Comment content and  ID are required"));
    }
  
    try {
      // Create the new comment with owner information
      const newComment = await Comment.create({
        content: comment,
        video: videoId,
        owner: userId,
      });
  
      // Respond with success message and comment data
      return res
        .status(201)
        .json(ApiResponse.success(201, newComment, "Comment created successfully"));
    } catch (error) {
      // Handle database or internal server errors
      return res
        .status(500)
        .json(ApiResponse.error("Failed to create comment due to server error"));
    }
  });
  
  

const updateComment = asyncHandler(async (req, res) => {
});

const deleteComment = asyncHandler(async (req, res) => {
});

export { getVideoComments, addComment, updateComment, deleteComment };
