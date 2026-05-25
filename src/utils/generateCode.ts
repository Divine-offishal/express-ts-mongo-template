import crypto from "crypto";

const CODE_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

export const generateCode = async (): Promise<{
  code: string;
  codeExpiresAt: Date;
}> => {
  const code = crypto.randomInt(1000, 9999).toString();
  const codeExpiresAt = new Date(Date.now() + CODE_EXPIRATION_TIME);
  return { code, codeExpiresAt };
};
