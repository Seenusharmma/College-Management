import { z } from 'zod';

export const createContentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  type: z.enum(['notes', 'assignments', 'pyqs', 'events', 'jobs', 'other']),
  branch: z.string().min(2).max(50),
  semester: z.coerce.number().int().min(0).max(8).optional(),
  subject: z.string().min(2).max(100),
  tags: z.string().optional()
});

export const updateContentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  type: z.enum(['notes', 'assignments', 'pyqs', 'events', 'jobs', 'other']).optional(),
  branch: z.string().min(2).max(50).optional(),
  semester: z.coerce.number().int().min(0).max(8).optional(),
  subject: z.string().min(2).max(100).optional(),
  tags: z.string().optional(),
  isActive: z.boolean().optional()
});

export const contentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().default('-createdAt'),
  type: z.string().optional(),
  branch: z.string().optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  subject: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().optional()
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  branch: z.string().min(2).max(50).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  role: z.enum(['student', 'teacher', 'super_admin']).optional()
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ContentQueryInput = z.infer<typeof contentQuerySchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
