import express from "express";
import UserController from "../controllers/userController";
import { errorHandler } from "../exceptions/errorHandle";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticateUser);

router.get("/profile", errorHandler(UserController.getProfile));
router.get("/:userId", errorHandler(UserController.getUserById));
router.patch("/profile", errorHandler(UserController.updateProfile));
router.patch("/change-password", errorHandler(UserController.changePassword));

export default router;
