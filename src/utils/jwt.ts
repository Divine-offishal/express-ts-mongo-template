import jwt, { VerifyErrors } from "jsonwebtoken";
import CONFIG from "../config/config";

const JWT_SECRET = CONFIG.ENV.JWT_SECRET as string;

interface DecodedToken {
  id: string;
  userType: string;
  iat: number;
  exp: number;
}

export const signToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30min",
  });
};

export const verifyToken = (token: string): Promise<DecodedToken> => {
  const secret = CONFIG.ENV.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret not configured");
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err: VerifyErrors | null, decoded: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as DecodedToken);
      }
    });
  });
};

export const signRefreshToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
