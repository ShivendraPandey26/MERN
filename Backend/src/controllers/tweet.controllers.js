import Tweet from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!tweet) {
    return res
      .status(500)
      .json({ message: "Internal Server Error Failed to create tweet" });
  }

  return res
    .status(200)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "Owner ID is required" });
  }

  try {
    // Find all tweets for the given owner (userId) and populate the user details
    const tweets = await Tweet.find({ owner: userId })
      .populate({
        path: "owner",
        select: "username fullName avatar",
      })
      .sort({ createdAt: -1 }); // Sort by most recent tweets

    if (!tweets.length) {
      return res.status(404).json({ message: "No tweets found for this user" });
    }

    res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
  } catch (error) {
    console.error("Error fetching tweets by owner:", error);
    return res.status(500).json({
      message: "Internal Server Error while fetching tweets",
    });
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { content },
      { new: true }
    );

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
  } catch (error) {
    // console.error("Error updating tweet:", error);
    return res.status(500).json({
      message: "Internal Server Error while updating tweet",
    });
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  try {
    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet deleted successfully"));
  } catch (error) {
    // console.error("Error deleting tweet:", error);
    return res.status(500).json({
      message: "Internal Server Error while deleting tweet",
    });
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
