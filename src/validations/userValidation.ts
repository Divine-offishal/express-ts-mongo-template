import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters"),
  lastName: z.string().min(3, "Last name must be at least 3 characters"),
  userName: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().nonempty("Email is required").pipe(z.email("Invalid email format")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().nonempty("Email is required").pipe(z.email("Invalid email format")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(3).optional(),
    lastName: z.string().min(3).optional(),
    phoneNumber: z.string().optional(),
    userName: z.string().optional(),
    avatar: z.string().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined && v !== ""), {
    message: "At least one field must be provided",
    path: ["_error"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const emailSchema = z.object({
  email: z.string({ message: "Email is required" }).email("Invalid email format"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const adminLoginSchema = z.object({
  email: z.string().nonempty("Email is required").pipe(z.email("Invalid email format")),
  password: z.string().min(1, "Password is required"),
});

export const addAdminSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "super-admin"]),
});

export const changeAdminPasswordSchema = z
  .object({
    adminId: z.string().min(1, "Admin ID is required"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
