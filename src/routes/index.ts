import express from "express";
import AuthRoute from "./authRoutes";
import UserRoute from "./userRoutes";
import MediaRoute from "./mediaRoutes";
import AdminRoute from "./adminRoutes";

const router = express.Router();

router.use("/auth", AuthRoute);
router.use("/user", UserRoute);
router.use("/media", MediaRoute);
router.use("/admin", AdminRoute);

export default router;
