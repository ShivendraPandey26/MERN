import { config } from "dotenv";
config();
import connectDB from "./db/index.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

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



// routes declarations
app.use("/api/v1/users", userRouter);




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
