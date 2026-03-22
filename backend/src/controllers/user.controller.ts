import { Request, Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/index.js';
import { userService } from '../services/user.service.js';
import { AppError } from '../middlewares/errorHandler.js';
import { clerkClient } from '@clerk/express';

export class UserController {
  async syncUser(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      let clerkUser;
      try {
        clerkUser = await clerkClient.users.getUser(req.user.id);
      } catch {
        throw new AppError('Failed to fetch user from Clerk', 400);
      }

      const user = await userService.findOrCreate(
        req.user.id,
        clerkUser.emailAddresses[0]?.emailAddress || '',
        clerkUser.fullName || 'Unknown',
        clerkUser.imageUrl
      );

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async getProfile(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const user = await userService.findByClerkId(req.user!.id);
      
      if (!user) {
        res.json({
          success: true,
          data: null
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async updateProfile(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const user = await userService.findByClerkId(req.user!.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const updated = await userService.update(user._id.toString(), req.body);

      res.json({
        success: true,
        data: updated,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async addBookmark(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const user = await userService.findByClerkId(req.user!.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const updated = await userService.addBookmark(
        user._id.toString(),
        req.params.contentId
      );

      res.json({
        success: true,
        data: updated,
        message: 'Bookmark added'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async removeBookmark(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const user = await userService.findByClerkId(req.user!.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const updated = await userService.removeBookmark(
        user._id.toString(),
        req.params.contentId
      );

      res.json({
        success: true,
        data: updated,
        message: 'Bookmark removed'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async getBookmarks(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const user = await userService.findByClerkId(req.user!.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const userWithBookmarks = await userService.getBookmarks(user._id.toString());

      res.json({
        success: true,
        data: userWithBookmarks.bookmarks
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async getAllUsers(req: Request, res: Response<ApiResponse>) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await userService.getAllUsers(page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async updateUserRole(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updated = await userService.updateRole(id, role);

      res.json({
        success: true,
        data: updated,
        message: 'Role updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }
}

export const userController = new UserController();
