import express from "express";
import AdminController from "../controllers/adminController";
import { errorHandler } from "../exceptions/errorHandle";
import { authenticateUser, requireAdmin, requireSuperAdmin } from "../middlewares/authMiddleware";

const router = express.Router();

// Public admin auth
router.post("/login", errorHandler(AdminController.login));

// Requires admin authentication
router.use(authenticateUser, requireAdmin);
router.get("/users", errorHandler(AdminController.getUsers));
router.patch("/users/:userId/suspend", errorHandler(AdminController.toggleSuspension));

router.post("/change-password", errorHandler(AdminController.changePassword));

// Super-admin only
router.use(requireSuperAdmin);
router.post("/add-admin", errorHandler(AdminController.addAdmin));
router.delete("/users/:userId", errorHandler(AdminController.deleteUser));

export default router;
