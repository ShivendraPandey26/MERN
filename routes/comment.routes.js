import { Router } from "express";
import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Routes for comments
router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
