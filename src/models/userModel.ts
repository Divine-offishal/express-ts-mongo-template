import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber?: string;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  isSuspended: boolean;
  isVerified: boolean;
  resetCode?: string;
  resetCodeExpiresAt?: Date;
  role: "user" | "admin" | "super-admin";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String, default: "" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    isSuspended: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false, required: true },
    verificationCode: { type: String },
    verificationCodeExpiresAt: { type: Date },
    resetCode: { type: String },
    resetCodeExpiresAt: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
