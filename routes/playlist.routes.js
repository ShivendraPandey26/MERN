import { Router } from "express";
import {
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  updatePlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  addVideoToPlaylist,
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;
