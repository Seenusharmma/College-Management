import { Content, IContent } from '../models/content.model.js';
import { CreateContentInput, UpdateContentInput } from '../validators/content.validator.js';
import { PaginatedResponse, ContentFilters } from '../types/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary.service.js';
import { Types } from 'mongoose';

export class ContentService {
  async create(
    data: CreateContentInput,
    file: Express.Multer.File,
    userId: string
  ): Promise<IContent> {
    const uploadResult = await uploadToCloudinary({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer
    });

    const tagsArray = data.tags 
      ? (typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : data.tags)
      : [];

    const content = new Content({
      title: data.title,
      description: data.description,
      type: data.type,
      branch: data.branch,
      semester: data.semester || 0,
      subject: data.subject,
      tags: tagsArray,
      fileUrl: uploadResult.url,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: userId
    });

    await content.save();
    return content;
  }

  async findAll(
    filters: ContentFilters,
    page: number,
    limit: number,
    sort: string
  ): Promise<PaginatedResponse<IContent>> {
    const query: Record<string, unknown> = { isActive: true };

    if (filters.type) query.type = filters.type;
    if (filters.branch) query.branch = filters.branch;
    if (filters.semester) query.semester = filters.semester;
    if (filters.subject) query.subject = { $regex: filters.subject, $options: 'i' };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.tags?.length) {
      query.tags = { $in: filters.tags };
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {};
    
    if (sort.startsWith('-')) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [data, total] = await Promise.all([
      Content.find(query)
        .populate('uploadedBy', 'name email avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(query)
    ]);

    return {
      data: data as unknown as IContent[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string): Promise<IContent> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid content ID', 400);
    }

    const content = await Content.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('uploadedBy', 'name email avatar role')
      .lean();

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    return content as unknown as IContent;
  }

  async update(
    id: string,
    data: UpdateContentInput,
    userId: string,
    userRole: string
  ): Promise<IContent> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid content ID', 400);
    }

    const content = await Content.findById(id);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    if (content.uploadedBy.toString() !== userId && userRole !== 'super_admin') {
      throw new AppError('Not authorized to update this content', 403);
    }

    const updated = await Content.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email avatar');

    return updated as IContent;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid content ID', 400);
    }

    const content = await Content.findById(id);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    if (content.uploadedBy.toString() !== userId && userRole !== 'super_admin') {
      throw new AppError('Not authorized to delete this content', 403);
    }

    const publicId = content.fileUrl.split('/').pop()?.split('.')[0];
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Failed to delete file from Cloudinary:', error);
      }
    }

    await Content.findByIdAndDelete(id);
  }

  async incrementDownloads(id: string): Promise<void> {
    await Content.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byBranch: Record<string, number>;
  }> {
    const [total, byType, byBranch] = await Promise.all([
      Content.countDocuments({ isActive: true }),
      Content.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Content.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$branch', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
      byBranch: Object.fromEntries(byBranch.map(b => [b._id, b.count]))
    };
  }
}

export const contentService = new ContentService();
