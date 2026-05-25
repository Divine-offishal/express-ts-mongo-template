import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import HttpException from "./httpException";
import logger from "../utils/logger";
import statusCodes from "../constants/statusCodes";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const formatZodError = (
  error: ZodError
): { path: string; message: string; code: string }[] => {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
};

export const errorHandler = (method: AsyncRequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await method(req, res, next);
    } catch (error: any) {
      console.log("Error caught in errorHandler:", error);
      let exception: HttpException;

      if (error instanceof HttpException) {
        exception = error;
      } else if (error instanceof ZodError) {
        const formatted = formatZodError(error);
        exception = new HttpException(statusCodes.BAD_REQUEST, formatted[0].message, formatted);
      } else if (error instanceof mongoose.Error.ValidationError) {
        exception = new HttpException(
          statusCodes.BAD_REQUEST,
          "Mongoose validation error",
          error.errors
        );
      } else if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
        exception = new HttpException(
          statusCodes.CONFLICT,
          "Duplicate key error",
          error.keyValue
        );
      } else if (error instanceof Error) {
        switch (error.message) {
          case "Authorization denied":
            exception = new HttpException(statusCodes.UNAUTHORIZED, "Authorization denied");
            break;
          case "Not Authorized":
            exception = new HttpException(statusCodes.FORBIDDEN, "Forbidden");
            break;
          case "Not Found":
            exception = new HttpException(statusCodes.NOT_FOUND, "Resource Not Found");
            break;
          case "Bad Request":
            exception = new HttpException(statusCodes.BAD_REQUEST, "Bad Request");
            break;
          default:
            exception = new HttpException(
              statusCodes.INTERNAL_SERVER_ERROR,
              "Internal Server Error",
              error.message
            );
        }
      } else {
        exception = new HttpException(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          error
        );
      }

      logger.error({
        message: exception.message,
        status: exception.status,
        details: exception.details,
      });

      res.status(exception.status).json({
        status: exception.status,
        success: false,
        message: exception.message,
        details: exception.details,
      });
    }
  };
};

