import { Request, Response, NextFunction } from "express";
import UserService from "../services/userService";
import HttpException from "../exceptions/httpException";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface User {
      id: string;
      userType?: string;
      role?: string;
      [key: string]: unknown;
    }
    interface Request {
      user?: User;
    }
  }
}

export const authenticateUser = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpException(401, "Authorization header is missing or invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await verifyToken(token);
    const user = await UserService.getUserById(decoded.id);

    if (!user) {
      throw new HttpException(401, "User not found");
    }

    if (user.isSuspended) {
      throw new HttpException(403, "Your account has been suspended. Contact support.");
    }

    req.user = {
      ...user,
      id: user._id ?? "",
    };

    next();
  } catch (err) {
    if (err instanceof HttpException) {
      return next(err);
    }
    return next(new HttpException(401, "Invalid or expired token"));
  }
};

export const requireSuperAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "super-admin") {
    throw new HttpException(403, "Super Admin access required");
  }
  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new HttpException(403, "Admin access required");
  }

  if (req.user.role === "super-admin" || req.user.role === "admin") {
    return next();
  }

  throw new HttpException(403, "Admin access required");
};
