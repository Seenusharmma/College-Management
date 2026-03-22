import { User, IUser, UserRole } from '../models/user.model.js';
import { AppError } from '../middlewares/errorHandler.js';
import { UserUpdateInput } from '../validators/content.validator.js';
import { Types } from 'mongoose';

export class UserService {
  async findOrCreate(clerkUserId: string, email: string, name: string, avatar?: string): Promise<IUser> {
    let user = await User.findOne({ clerkUserId });
    
    if (!user) {
      user = new User({
        clerkUserId,
        email,
        name,
        avatar,
        role: UserRole.STUDENT
      });
      await user.save();
    }
    
    return user;
  }

  async findById(id: string): Promise<IUser> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(id).select('-bookmarks');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async findByClerkId(clerkUserId: string): Promise<IUser | null> {
    return User.findOne({ clerkUserId });
  }

  async update(id: string, data: UserUpdateInput): Promise<IUser> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async addBookmark(userId: string, contentId: string): Promise<IUser> {
    if (!Types.ObjectId.isValid(contentId)) {
      throw new AppError('Invalid content ID', 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { bookmarks: contentId } },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async removeBookmark(userId: string, contentId: string): Promise<IUser> {
    if (!Types.ObjectId.isValid(contentId)) {
      throw new AppError('Invalid content ID', 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { bookmarks: contentId } },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async getBookmarks(userId: string): Promise<IUser> {
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: { path: 'uploadedBy', select: 'name email avatar' }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 20): Promise<{
    data: IUser[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      User.find().select('-bookmarks').skip(skip).limit(limit).lean(),
      User.countDocuments()
    ]);

    return {
      data: data as unknown as IUser[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateRole(userId: string, role: UserRole): Promise<IUser> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export const userService = new UserService();
