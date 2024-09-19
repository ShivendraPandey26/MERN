import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { config } from "dotenv";
config();

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized request, token missing." });
    }

    
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res
        .status(401)
        .json({
          message: "Invalid access token.",
          status: 401,
        });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Unauthorized request, invalid token." });
  }
});
