import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinaryConfig";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    return {
      folder: "uploads",
      format: file.mimetype.split("/")[1],
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: file.originalname.split(".")[0],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;
