import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/httpException";
import statusCodes from "../constants/statusCodes";
import MediaService from "../services/mediaService";
import { successResponse } from "../exceptions/response";

export class MediaController {
  static async uploadFile(req: Request, res: Response) {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      throw new HttpException(statusCodes.BAD_REQUEST, "No file uploaded");
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      throw new HttpException(statusCodes.BAD_REQUEST, "File size exceeds 10MB limit");
    }

    const url = await MediaService.uploadSingle(file);

    successResponse(res, { url }, "File uploaded successfully", statusCodes.CREATED);
  }

  static async uploadFiles(req: Request, res: Response) {
    const files = req.files;

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new HttpException(statusCodes.BAD_REQUEST, "No files uploaded");
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);

    if (oversizedFile) {
      throw new HttpException(
        statusCodes.BAD_REQUEST,
        `File "${oversizedFile.originalname}" exceeds 10MB limit`
      );
    }

    const urls = await MediaService.uploadMultiple(files);

    successResponse(res, { urls }, "Files uploaded successfully", statusCodes.CREATED);
  }
}
