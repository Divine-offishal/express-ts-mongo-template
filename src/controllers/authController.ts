import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  emailSchema,
  resetPasswordSchema,
} from "../validations/userValidation";
import HttpException from "../exceptions/httpException";
import statusCodes from "../constants/statusCodes";
import UserService from "../services/userService";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { generateCode } from "../utils/generateCode";
import { sanitizeUser } from "../utils/sanitizeUser";
import {
  passwordResetSuccessEmail,
  sendResendVerifyCode,
  sendResetPasswordEmail,
  sendSignUpEmail,
} from "../email/emailService";
import { successResponse } from "../exceptions/response";
import { signRefreshToken, signToken, verifyRefreshToken } from "../utils/jwt";

const AuthController = {
  register: async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const { firstName, lastName, userName, email, password, phoneNumber } = result.data;
    const lowerCaseEmail = email.toLowerCase();

    const [existingEmail, existingUserName] = await Promise.all([
      UserService.getUserByEmail(lowerCaseEmail),
      UserService.getUserByUserName(userName),
    ]);

    if (existingEmail) throw new HttpException(statusCodes.BAD_REQUEST, "Email already in use.");
    if (existingUserName) throw new HttpException(statusCodes.BAD_REQUEST, "Username already taken.");

    const hashedPassword = await hashPassword(password);

    const user = await UserService.createUser({
      email: lowerCaseEmail,
      password: hashedPassword,
      firstName,
      lastName,
      userName,
      phoneNumber,
    });

    const { code, codeExpiresAt } = await generateCode();
    await Promise.all([
      sendSignUpEmail(user.email, code),
      UserService.updateUser(user._id, {
        verificationCode: code,
        verificationCodeExpiresAt: codeExpiresAt,
      }),
    ]);

    successResponse(
      res,
      { userId: user._id, email: user.email },
      "Account created. Check your email for the verification code.",
      statusCodes.CREATED
    );
  },

  verifyAccount: async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) throw new HttpException(statusCodes.BAD_REQUEST, "Verification code is required.");

    const user = await UserService.getUserByVerificationCode(code);
    if (!user) throw new HttpException(statusCodes.BAD_REQUEST, "Invalid or expired code.");

    if (!user.verificationCodeExpiresAt || new Date() > user.verificationCodeExpiresAt) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Verification code has expired.");
    }

    const updated = await UserService.updateUser(user._id, {
      isVerified: true,
      verificationCode: undefined,
      verificationCodeExpiresAt: undefined,
    });

    successResponse(res, { user: sanitizeUser(updated as any) }, "Account verified.", statusCodes.SUCCESS);
  },

  resendVerificationCode: async (req: Request, res: Response) => {
    const result = emailSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const user = await UserService.getUserByEmail(result.data.email);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");
    if (user.isVerified) throw new HttpException(statusCodes.BAD_REQUEST, "Account is already verified.");

    const { code, codeExpiresAt } = await generateCode();
    await Promise.all([
      sendResendVerifyCode(user.email, code),
      UserService.updateUser(user._id, {
        verificationCode: code,
        verificationCodeExpiresAt: codeExpiresAt,
      }),
    ]);

    successResponse(res, null, "Verification code resent.", statusCodes.SUCCESS);
  },

  login: async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const { email, password } = result.data;
    const user = await UserService.getUserByEmail(email.toLowerCase());

    if (!user) throw new HttpException(statusCodes.BAD_REQUEST, "Invalid email or password.");
    if (!user.password) throw new HttpException(statusCodes.BAD_REQUEST, "Invalid email or password.");
    if (!(await comparePassword(password, user.password))) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Invalid email or password.");
    }

    if (user.isSuspended) {
      throw new HttpException(statusCodes.FORBIDDEN, "Your account has been suspended. Contact support.");
    }

    const token = signToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id, email: user.email, role: user.role });

    successResponse(
      res,
      { token, refreshToken, user: sanitizeUser(user as any) },
      "Logged in successfully.",
      statusCodes.SUCCESS
    );
  },

  requestPasswordReset: async (req: Request, res: Response) => {
    const result = emailSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const user = await UserService.getUserByEmail(result.data.email);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");

    const { code, codeExpiresAt } = await generateCode();
    await Promise.all([
      sendResetPasswordEmail(user.email, code),
      UserService.updateUser(user._id, {
        resetCode: code,
        resetCodeExpiresAt: codeExpiresAt,
      }),
    ]);

    successResponse(res, null, "Password reset code sent to your email.", statusCodes.SUCCESS);
  },

  verifyResetCode: async (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Email and code are required.");
    }

    const user = await UserService.getUserByEmail(email);
    if (!user || user.resetCode !== code) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Invalid code.");
    }

    if (!user.resetCodeExpiresAt || new Date() > user.resetCodeExpiresAt) {
      throw new HttpException(statusCodes.BAD_REQUEST, "Reset code has expired.");
    }

    successResponse(res, null, "Code verified. You may now reset your password.", statusCodes.SUCCESS);
  },

  resetPassword: async (req: Request, res: Response) => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      throw new HttpException(statusCodes.BAD_REQUEST, result.error.issues?.[0]?.message);
    }

    const { email, password } = result.data;
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new HttpException(statusCodes.NOT_FOUND, "User not found.");

    const hashedPassword = await hashPassword(password);
    await UserService.updateUser(user._id, {
      password: hashedPassword,
      resetCode: undefined,
      resetCodeExpiresAt: undefined,
    });

    await passwordResetSuccessEmail(email);

    successResponse(res, null, "Password reset successfully.", statusCodes.SUCCESS);
  },

  refreshToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new HttpException(statusCodes.BAD_REQUEST, "Refresh token required.");

    const decoded = verifyRefreshToken(refreshToken) as { id: string; email: string; role: string };
    const token = signToken({ id: decoded.id, email: decoded.email, role: decoded.role });

    successResponse(res, { token }, "Token refreshed.", statusCodes.SUCCESS);
  },

  logout: async (req: Request, res: Response) => {
    // Token blacklisting can be implemented here when needed
    successResponse(res, null, "Logged out successfully.", statusCodes.SUCCESS);
  },
};

export default AuthController;
