export interface Content {
  _id: string;
  title: string;
  description: string;
  type: 'notes' | 'assignments' | 'pyqs' | 'events' | 'jobs' | 'other';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  branch: string;
  semester: number;
  subject: string;
  tags: string[];
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  downloads: number;
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Semester {
  id: number;
  name: string;
}

export interface ContentType {
  id: string;
  name: string;
}

export const CONTENT_TYPES: ContentType[] = [
  { id: 'notes', name: 'Notes' },
  { id: 'assignments', name: 'Assignments' },
  { id: 'pyqs', name: 'Previous Year Questions' },
  { id: 'events', name: 'Events' },
  { id: 'jobs', name: 'Jobs & Internships' },
  { id: 'other', name: 'Other' }
];

export const BRANCHES: Branch[] = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'ec', name: 'Electronics & Communication' },
  { id: 'ee', name: 'Electrical Engineering' },
  { id: 'me', name: 'Mechanical Engineering' },
  { id: 'ce', name: 'Civil Engineering' },
  { id: 'it', name: 'Information Technology' }
];

export const SEMESTERS: Semester[] = [
  { id: 1, name: 'Semester 1' },
  { id: 2, name: 'Semester 2' },
  { id: 3, name: 'Semester 3' },
  { id: 4, name: 'Semester 4' },
  { id: 5, name: 'Semester 5' },
  { id: 6, name: 'Semester 6' },
  { id: 7, name: 'Semester 7' },
  { id: 8, name: 'Semester 8' }
];

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export interface User {
  _id: string;
  clerkUserId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
