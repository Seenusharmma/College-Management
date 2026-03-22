import { Request } from 'express';
import { IUser } from '../models/user.model.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  userId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContentFilters {
  type?: string;
  branch?: string;
  semester?: number;
  subject?: string;
  search?: string;
  tags?: string[];
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
}
