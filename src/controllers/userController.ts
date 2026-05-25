import { Request, Response } from "express";
import HttpException from "../exceptions/httpException";
import statusCodes from "../constants/statusCodes";
import UserService from "../services/userService";
import { successResponse } from "../exceptions/response";
import { changePasswordSuccessEmail } from "../email/emailService";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { updateProfileSchema, changePasswordSchema } from "../validations/userValidation";
import { sanitizeUser } from "../utils/sanitizeUser";

const UserController = {
  getProfile: async (req: Request, res: Response) => {
    const user = await UserService.getUserById(req.user!.id);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");

    successResponse(res, { user: sanitizeUser(user as any) }, "Profile fetched.", statusCodes.SUCCESS);
  },

  getUserById: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await UserService.getUserById(userId);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");

    successResponse(res, { user: sanitizeUser(user as any) }, "User fetched.", statusCodes.SUCCESS);
  },

  updateProfile: async (req: Request, res: Response) => {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const updated = await UserService.updateUser(req.user!.id, result.data);
    if (!updated) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");

    successResponse(res, { user: sanitizeUser(updated as any) }, "Profile updated.", statusCodes.SUCCESS);
  },

  changePassword: async (req: Request, res: Response) => {
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const { currentPassword, newPassword } = result.data;

    const user = await UserService.getUserById(req.user!.id);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");
    if (!user.password) throw new HttpException(statusCodes.BAD_REQUEST, "No password set on this account.");

    if (!(await comparePassword(currentPassword, user.password))) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Current password is incorrect.");
    }

    await UserService.updateUser(user._id, { password: await hashPassword(newPassword) });
    await changePasswordSuccessEmail(user.email);

    successResponse(res, null, "Password changed successfully.", statusCodes.SUCCESS);
  },
};

export default UserController;
