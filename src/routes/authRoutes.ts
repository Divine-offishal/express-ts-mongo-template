import express from "express";
import AuthController from "../controllers/authController";
import { errorHandler } from "../exceptions/errorHandle";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", errorHandler(AuthController.register));
router.post("/verify-account", errorHandler(AuthController.verifyAccount));
router.post("/resend-verify-codes", errorHandler(AuthController.resendVerificationCode));
router.post("/login", errorHandler(AuthController.login));
router.post("/request-password-reset", errorHandler(AuthController.requestPasswordReset));
router.post("/verify-reset-code", errorHandler(AuthController.verifyResetCode));
router.post("/reset-password", errorHandler(AuthController.resetPassword));
router.post("/refresh-token", errorHandler(AuthController.refreshToken));

router.use(authenticateUser);
router.post("/logout", errorHandler(AuthController.logout));

export default router;
