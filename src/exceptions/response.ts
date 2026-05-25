import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  data: T,
  message = "Success",
  status: number
) => {
  return res.status(status).json({
    success: true,
    status,
    message,
    data,
  });
};

export const successRedirect = <T>(
  res: Response,
  data: T,
  message: string,
  status: number,
  redirectUrl: string
) => {
  const query = new URLSearchParams({
    success: "true",
    status: status.toString(),
    message,
  }).toString();

  const fullRedirectUrl = `${redirectUrl}?${query}`;

  return res.redirect(302, fullRedirectUrl);
};
