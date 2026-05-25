import express from "express";
import { errorHandler } from "../exceptions/errorHandle";
import multer from "multer";
import { MediaController } from "../controllers/mediaController";
// import { authenticateUser } from "../middlewares/auth.middleware";

const mediaRoutes = express.Router();

const storage = multer.memoryStorage();

const media = multer({
  storage,
  limits: { fileSize: 13 * 1024 * 1024 },
});

// mediaRoutes.use(authenticateUser);

mediaRoutes.post("/single", media.single("file"), errorHandler(MediaController.uploadFile));

mediaRoutes.post("/multiple", media.array("files", 5), errorHandler(MediaController.uploadFiles));

export default mediaRoutes;
