import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

dotenv.config({
  path: './.env'
})

// Environment variables
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// routes imports
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js"
import commentRouter from "./routes/comment.routes.js"


// routes declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/comments", commentRouter);




// Connect to MongoDB
connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("Server Error", err);
      process.exit(1);
    });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB!!!", error);
    process.exit(1);
  });
