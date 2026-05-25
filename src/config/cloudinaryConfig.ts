import { v2 as cloudinary } from "cloudinary";
import CONFIG from "./config";

cloudinary.config({
  cloud_name: CONFIG.ENV.CLOUDINARY_CLOUD_NAME,
  api_key: CONFIG.ENV.CLOUDINARY_API_KEY,
  api_secret: CONFIG.ENV.CLOUDINARY_API_SECRET,
});

export default cloudinary;
