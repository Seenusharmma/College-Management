import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/index.js';
import { contentService } from '../services/content.service.js';
import { contentQuerySchema, createContentSchema, updateContentSchema } from '../validators/content.validator.js';
import { AppError } from '../middlewares/errorHandler.js';

export class ContentController {
  async create(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.file) {
        throw new AppError('File is required', 400);
      }

      const validatedData = createContentSchema.parse(req.body);
      const content = await contentService.create(
        validatedData,
        req.file,
        req.userId!
      );

      res.status(201).json({
        success: true,
        data: content,
        message: 'Content created successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async findAll(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const query = contentQuerySchema.parse(req.query);
      const { search, tags, ...filters } = query;

      const result = await contentService.findAll(
        { search, tags: tags?.split(','), ...filters },
        query.page,
        query.limit,
        query.sort
      );

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

  async findById(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const content = await contentService.findById(id);

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async update(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const validatedData = updateContentSchema.parse(req.body);
      const content = await contentService.update(
        id,
        validatedData,
        req.userId!,
        req.user?.role || 'student'
      );

      res.json({
        success: true,
        data: content,
        message: 'Content updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async delete(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      await contentService.delete(id, req.userId!, req.user?.role || 'student');

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async getStats(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const stats = await contentService.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async incrementDownloads(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      await contentService.incrementDownloads(id);
      res.json({
        success: true,
        message: 'Download counted'
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }
}

export const contentController = new ContentController();
