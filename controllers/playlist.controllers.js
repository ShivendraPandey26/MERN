import mongoose, { isValidObjectId } from "mongoose";
import Playlist from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required" });
  }

  try {
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id, // Assuming req.user contains the authenticated user's info
    });

    return res.status(201).json({
      status: 201,
      data: playlist,
      message: "Playlist created successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create playlist" });
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const playlists = await Playlist.find({ owner: userId });

    if (!playlists) {
      return res
        .status(404)
        .json({ message: "No playlists found for this user" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch playlists" });
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid playlist ID" });
  }

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist get successfully"));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error Failed to retrieve playlist" });
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Validate IDs
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid playlist or video ID" });
  }

  try {
    // Update playlist by adding video
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { videos: videoId } },
      { new: true, runValidators: true }
    ).populate("videos");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.status(200).json({
      status: 200,
      data: playlist,
      message: "Video added to playlist successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add video to playlist" });
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Validate IDs
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid playlist or video ID" });
  }

  try {
    // Update playlist by removing video
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } }, // Use $pull to remove the video
      { new: true }
    ).populate("videos"); // Optionally populate video details

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.status(200).json({
      status: 200,
      data: playlist,
      message: "Video removed from playlist successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to remove video from playlist" });
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid playlist ID" });
  }

  try {
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Playlist deleted successfully"));
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete playlist" });
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
