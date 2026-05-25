export const sanitizeUser = (user: Record<string, unknown>) => {
  const {
    password,
    verificationCode,
    verificationCodeExpiresAt,
    resetCode,
    resetCodeExpiresAt,
    __v,
    ...rest
  } = user;
  return rest;
};
