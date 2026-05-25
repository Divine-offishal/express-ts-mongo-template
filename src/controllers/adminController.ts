import { Request, Response } from "express";
import {
  adminLoginSchema,
  addAdminSchema,
  changeAdminPasswordSchema,
} from "../validations/userValidation";
import HttpException from "../exceptions/httpException";
import statusCodes from "../constants/statusCodes";
import UserService from "../services/userService";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { sanitizeUser } from "../utils/sanitizeUser";
import { successResponse } from "../exceptions/response";
import { signRefreshToken, signToken } from "../utils/jwt";
import { IPaginatedResult } from "../interfaces/paginationInterface";
import { IUser } from "../models/userModel";
import User from "../models/userModel";

const AdminController = {
  login: async (req: Request, res: Response) => {
    const result = adminLoginSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const { email, password } = result.data;
    const user = await UserService.getUserByEmail(email.toLowerCase());

    if (!user) throw new HttpException(statusCodes.BAD_REQUEST, "Invalid credentials.");

    if (user.role !== "admin" && user.role !== "super-admin") {
      throw new HttpException(statusCodes.FORBIDDEN, "Access denied.");
    }

    if (!user.password || !(await comparePassword(password, user.password))) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Invalid credentials.");
    }

    const token = signToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id, email: user.email, role: user.role });

    successResponse(
      res,
      { token, refreshToken, admin: sanitizeUser(user as any) },
      "Admin logged in successfully.",
      statusCodes.SUCCESS
    );
  },

  addAdmin: async (req: Request, res: Response) => {
    const result = addAdminSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const { email, password, role } = result.data;
    const lowerCaseEmail = email.toLowerCase();

    const existing = await UserService.getUserByEmail(lowerCaseEmail);
    if (existing) throw new HttpException(statusCodes.BAD_REQUEST, "User already exists.");

    const count = await User.countDocuments({ role });
    const suffix = (count + 1).toString().padStart(3, "0");

    const admin = await UserService.createUser({
      email: lowerCaseEmail,
      password: await hashPassword(password),
      firstName: "Admin",
      lastName: suffix,
      userName: `admin${suffix}`,
      role,
      isVerified: true,
    });

    successResponse(
      res,
      { admin: sanitizeUser(admin as any) },
      "Admin created successfully.",
      statusCodes.CREATED
    );
  },

  changePassword: async (req: Request, res: Response) => {
    const result = changeAdminPasswordSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const { adminId, currentPassword, newPassword } = result.data;

    const admin = await UserService.getUserById(adminId);
    if (!admin) throw new HttpException(statusCodes.NOT_FOUND, "Admin not found.");

    if (admin.role === "user") throw new HttpException(statusCodes.FORBIDDEN, "Access denied.");

    if (!(await comparePassword(currentPassword, admin.password!))) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Current password is incorrect.");
    }

    await UserService.updateUser(adminId, { password: await hashPassword(newPassword) });

    successResponse(res, null, "Password changed successfully.", statusCodes.SUCCESS);
  },

  getUsers: async (req: Request, res: Response) => {
    const { userName, page = 1, limit = 10 } = req.query;

    const result: IPaginatedResult<IUser> = await UserService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search: typeof userName === "string" ? userName.trim() : undefined,
    });

    successResponse(res, result, "Users fetched successfully.", statusCodes.SUCCESS);
  },

  toggleSuspension: async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) throw new HttpException(statusCodes.BAD_REQUEST, "User ID is required.");

    const user = await UserService.getUserById(userId);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");

    const updated = await UserService.updateUser(userId, { isSuspended: !user.isSuspended });

    successResponse(
      res,
      { isSuspended: updated?.isSuspended },
      user.isSuspended ? "User unsuspended." : "User suspended.",
      statusCodes.SUCCESS
    );
  },

  deleteUser: async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) throw new HttpException(statusCodes.BAD_REQUEST, "User ID is required.");

    const user = await UserService.getUserById(userId);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");

    await UserService.deleteUser(userId);

    successResponse(res, null, "User deleted successfully.", statusCodes.SUCCESS);
  },
};

export default AdminController;
