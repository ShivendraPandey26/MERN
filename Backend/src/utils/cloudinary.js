import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { config } from "dotenv";
config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// console.log("code", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

// Function to upload a local file to cloudinary and delete the local file after successful upload.
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

// Function to delete file from Cloudinary
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    // Extract public ID from the image URL
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];

    // Delete the image using public_id
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // Ensure it's marked as an image resource
    });

    if (result.result === "ok") {
      console.log("Image deleted successfully:", result);
      return true;
    } else {
      console.log("Failed to delete image:", result);
      return false;
    }
  } catch (error) {
    console.error("Error during image deletion:", error);
    return false;
  }
};

export { uploadOnCloudinary, deleteCloudinaryImage };
