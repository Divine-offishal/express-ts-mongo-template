import { IPaginatedResult, IPaginationOptions } from "../interfaces/paginationInterface";
import { IUser } from "../models/userModel";
import User from "../models/userModel";

const UserService = {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user.toObject();
  },

  async getAllUsers(
    pagination?: IPaginationOptions & { search?: string }
  ): Promise<IPaginatedResult<IUser>> {
    const filter: Record<string, unknown> = {};

    if (pagination?.search) {
      filter.userName = { $regex: pagination.search, $options: "i" };
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [totalItems, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).skip(skip).limit(limit).lean(),
    ]);

    return {
      items: users,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    };
  },

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    return user ? user.toObject() : null;
  },

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email });
    return user ? user.toObject() : null;
  },

  async getUserByUserName(userName: string): Promise<IUser | null> {
    const user = await User.findOne({ userName });
    return user ? user.toObject() : null;
  },

  async getUserByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    const user = await User.findOne({ phoneNumber });
    return user ? user.toObject() : null;
  },

  async searchUsersByUserName(userName: string): Promise<IUser[]> {
    const users = await User.find({ userName: { $regex: userName, $options: "i" } });
    return users.map((u) => u.toObject());
  },

  async getUserByVerificationCode(code: string): Promise<IUser | null> {
    const user = await User.findOne({ verificationCode: code });
    return user ? user.toObject() : null;
  },

  async updateUser(userId: string, userData: Partial<IUser>): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(userId, userData, { new: true });
    return user ? user.toObject() : null;
  },

  async deleteUser(userId: string): Promise<IUser | null> {
    const user = await User.findByIdAndDelete(userId);
    return user ? user.toObject() : null;
  },
};

export default UserService;
