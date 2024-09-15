import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
} from "../controllers/video.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllVideos)
  .post(
    verifyJWT,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "videoFile", maxCount: 1 },
    ]),
    publishAVideo
  );

router.route("/:videoId").get(getVideoById).delete(deleteVideo)

export default router;
