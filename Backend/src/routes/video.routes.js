import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
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
      { name: "video", maxCount: 1 },
    ]),
    verifyJWT,
    upload.fields([]),
    publishAVideo
  );

export default router;
