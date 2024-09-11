import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file on the cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file is uploaded successfully
    console.log(`File uploaded to Cloudinary: ${response.url}`);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove temporary file from cloudinary directory
    console.error(`Error uploading file to Cloudinary: ${error.message}`);
    return null;
  }
};

export { uploadOnCloudinary }
