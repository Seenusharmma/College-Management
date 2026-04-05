'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, FileText, Download, Eye, Upload, Trash2, Edit2, 
  BarChart3, CheckCircle, XCircle, TrendingUp, Calendar, Shield, UserCog, Image, X, Link as LinkIcon, BookOpen, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from '@/lib/download-file';
import { Content, CONTENT_TYPES, BRANCHES, SEMESTERS } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Stats {
  totalContent: number;
  totalDownloads: number;
  totalViews: number;
  totalStudents: number;
  contentByType: { name: string; count: number }[];
  contentByBranch: { name: string; count: number }[];
  recentActivity: { date: string; uploads: number; downloads: number }[];
}

interface ContentFormData {
  title: string;
  description: string;
  type: string;
  branch: string;
  semester: string;
  subject: string;
  tags: string;
  file: File | null;
}

interface GalleryFormData {
  title: string;
  description: string;
  file: File | null;
}

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  publicId: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventData {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  link?: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  link: string;
  file: File | null;
}

interface PYQData {
  _id: string;
  title: string;
  description: string;
  year: number;
  examType: string;
  branch: string;
  semester: number;
  subject: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
}

interface PYQFormData {
  title: string;
  description: string;
  year: string;
  examType: string;
  branch: string;
  semester: string;
  subject: string;
  file: File | null;
}

interface UserData {
  _id: string;
  clerkUserId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  branch?: string;
  semester?: number;
  isActive: boolean;
  createdAt?: string;
}

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#06b6d4'];

const ROLES = [
  { value: 'student', label: 'Student', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  { value: 'teacher', label: 'Teacher', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' },
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' }
];

interface AdminClientProps {
  userEmail: string;
  isSuperAdmin: boolean;
}

export default function AdminClient({ userEmail, isSuperAdmin }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'upload' | 'users' | 'gallery' | 'events' | 'pyq'>('overview');
  const [contents, setContents] = useState<Content[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [pyqs, setPyqs] = useState<PYQData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [editingEventFile, setEditingEventFile] = useState<File | null>(null);
  const [editingPYQ, setEditingPYQ] = useState<PYQData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewEventImage, setPreviewEventImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    type: 'notes',
    branch: 'cs',
    semester: '1',
    subject: '',
    tags: '',
    file: null
  });
  const [galleryFormData, setGalleryFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    file: null
  });
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    location: '',
    link: '',
    file: null
  });
  const [pyqFormData, setPyqFormData] = useState<PYQFormData>({
    title: '',
    description: '',
    year: new Date().getFullYear().toString(),
    examType: 'final',
    branch: 'cs',
    semester: '1',
    subject: '',
    file: null
  });

  useEffect(() => {
    fetchContent();
    fetchStats();
    fetchUsers();
    fetchGallery();
    fetchEvents();
    fetchPYQs();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content?limit=100');
      const data = await response.json();
      if (data.success) {
        setContents(data.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      if (data.success) {
        setGalleryItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchPYQs = async () => {
    try {
      const response = await fetch('/api/pyq?limit=100');
      const data = await response.json();
      if (data.success) {
        setPyqs(data.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch PYQs:', error);
    }
  };

  const handlePYQUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pyqFormData.file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', pyqFormData.title);
      uploadFormData.append('description', pyqFormData.description);
      uploadFormData.append('year', pyqFormData.year);
      uploadFormData.append('examType', pyqFormData.examType);
      uploadFormData.append('branch', pyqFormData.branch);
      uploadFormData.append('semester', pyqFormData.semester);
      uploadFormData.append('subject', pyqFormData.subject);
      uploadFormData.append('file', pyqFormData.file);
      uploadFormData.append('uploadedBy', userEmail);

      const response = await fetch('/api/pyq', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Question paper uploaded successfully!');
        setPyqFormData({
          title: '',
          description: '',
          year: new Date().getFullYear().toString(),
          examType: 'final',
          branch: 'cs',
          semester: '1',
          subject: '',
          file: null
        });
        fetchPYQs();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePYQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question paper?')) return;

    try {
      const response = await fetch(`/api/pyq/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Question paper deleted successfully');
        setPyqs(pyqs.filter(p => p._id !== id));
      } else {
        toast.error('Failed to delete question paper');
      }
    } catch {
      toast.error('Failed to delete question paper');
    }
  };

  const handleUpdatePYQ = async () => {
    if (!editingPYQ) return;

    setIsUploading(true);
    try {
      const response = await fetch(`/api/pyq/${editingPYQ._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingPYQ.title,
          description: editingPYQ.description,
          year: editingPYQ.year,
          examType: editingPYQ.examType,
          branch: editingPYQ.branch,
          semester: editingPYQ.semester,
          subject: editingPYQ.subject,
          isActive: editingPYQ.isActive
        })
      });

      if (response.ok) {
        toast.success('Question paper updated successfully');
        setEditingPYQ(null);
        fetchPYQs();
      } else {
        toast.error('Failed to update question paper');
      }
    } catch {
      toast.error('Failed to update question paper');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('type', formData.type);
      uploadFormData.append('branch', formData.branch);
      uploadFormData.append('semester', formData.semester);
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('tags', formData.tags);

      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Content uploaded successfully!');
        setFormData({
          title: '',
          description: '',
          type: 'notes',
          branch: 'cs',
          semester: '1',
          subject: '',
          tags: '',
          file: null
        });
        fetchContent();
        fetchStats();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFormData.file) {
      toast.error('Please select an image');
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', galleryFormData.file);
      uploadFormData.append('title', galleryFormData.title);
      uploadFormData.append('description', galleryFormData.description);

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Gallery image uploaded successfully!');
        setGalleryFormData({
          title: '',
          description: '',
          file: null
        });
        setPreviewImage(null);
        fetchGallery();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEventUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title || !eventFormData.date) {
      toast.error('Title and date are required');
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', eventFormData.title);
      uploadFormData.append('description', eventFormData.description);
      uploadFormData.append('date', eventFormData.date);
      uploadFormData.append('location', eventFormData.location);
      uploadFormData.append('link', eventFormData.link);
      if (eventFormData.file) {
        uploadFormData.append('file', eventFormData.file);
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Event created successfully!');
        setEventFormData({
          title: '',
          description: '',
          date: '',
          location: '',
          link: '',
          file: null
        });
        setPreviewEventImage(null);
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to create event');
      }
    } catch (error) {
      toast.error('Failed to create event');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        setEvents(events.filter(e => e._id !== id));
      } else {
        toast.error('Failed to delete event');
      }
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', editingEvent.title);
      formData.append('description', editingEvent.description);
      formData.append('date', editingEvent.date);
      formData.append('location', editingEvent.location);
      formData.append('link', editingEvent.link || '');
      if (editingEvent.imageUrl === null || editingEvent.imageUrl === undefined) {
        formData.append('removeImage', 'true');
      }
      if (editingEventFile) {
        formData.append('file', editingEventFile);
      }

      const response = await fetch(`/api/events/${editingEvent._id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        toast.success('Event updated successfully');
        setEditingEvent(null);
        setEditingEventFile(null);
        fetchEvents();
      } else {
        toast.error('Failed to update event');
      }
    } catch {
      toast.error('Failed to update event');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Content deleted successfully');
        setContents(contents.filter(c => c._id !== id));
        fetchStats();
      } else {
        toast.error('Failed to delete content');
      }
    } catch {
      toast.error('Failed to delete content');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Gallery image deleted successfully');
        setGalleryItems(galleryItems.filter(g => g._id !== id));
      } else {
        toast.error('Failed to delete image');
      }
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const handleUpdate = async () => {
    if (!editingContent) return;

    try {
      const response = await fetch(`/api/content/${editingContent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingContent.title,
          description: editingContent.description,
          isActive: editingContent.isActive
        })
      });

      if (response.ok) {
        toast.success('Content updated successfully');
        setEditingContent(null);
        fetchContent();
      } else {
        toast.error('Failed to update content');
      }
    } catch {
      toast.error('Failed to update content');
    }
  };

  const handleUpdateGallery = async () => {
    if (!editingGallery) return;

    try {
      const response = await fetch(`/api/gallery/${editingGallery._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingGallery.title,
          description: editingGallery.description,
          isActive: editingGallery.isActive
        })
      });

      if (response.ok) {
        toast.success('Gallery item updated successfully');
        setEditingGallery(null);
        fetchGallery();
      } else {
        toast.error('Failed to update gallery item');
      }
    } catch {
      toast.error('Failed to update gallery item');
    }
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.clerkUserId,
          role: editingUser.role
        })
      });

      if (response.ok) {
        toast.success('User role updated successfully');
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update user');
      }
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDownload = async (content: Content) => {
    try {
      const filename = `${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.${content.fileType.split('/')[1] || 'pdf'}`;
      await downloadFile({ url: content.fileUrl, filename });
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryFormData({ ...galleryFormData, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEventFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventFormData({ ...eventFormData, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewEventImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleData = ROLES.find(r => r.value === role);
    return (
      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold", roleData?.color || '')}>
        {roleData?.label || role}
      </span>
    );
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'content' as const, label: 'Content', icon: FileText },
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'gallery' as const, label: 'Gallery', icon: Image },
    { id: 'events' as const, label: 'Events', icon: Calendar },
    { id: 'pyq' as const, label: 'PYQ', icon: BookOpen },
    { id: 'users' as const, label: 'Users', icon: UserCog },
  ];

  const statCards = [
    { label: 'Total Content', value: stats?.totalContent || contents.length, icon: FileText, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30' },
    { label: 'Total Users', value: stats?.totalStudents || users.length, icon: Users, gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30' },
    { label: 'Downloads', value: stats?.totalDownloads || 0, icon: Download, gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' }
  ];

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="max-w-md mx-auto py-16">
          <Card className="p-8 text-center border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-950/30 dark:to-red-950/30 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Access Denied</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              You need super admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                Go to Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-base">
                Manage content, users, and monitor platform activity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-lg text-sm font-medium">
                {userEmail}
              </Badge>
              <Badge className="rounded-lg text-sm font-medium bg-gradient-to-r from-rose-500 to-red-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-xl whitespace-nowrap font-medium transition-all duration-200",
                  activeTab === tab.id && [
                    "bg-gradient-to-r from-indigo-500 to-purple-500",
                    "hover:from-indigo-600 hover:to-purple-600",
                    "text-white shadow-lg shadow-indigo-500/25"
                  ],
                  activeTab !== tab.id && [
                    "border-zinc-200 dark:border-zinc-700",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  ]
                )}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "relative overflow-hidden p-5",
                      "border-zinc-200/50 dark:border-zinc-800/50",
                      "bg-white/80 dark:bg-zinc-900/80",
                      "backdrop-blur-sm",
                      "hover:shadow-lg hover:shadow-zinc-950/5",
                      "transition-all duration-300"
                    )}>
                      <div className={cn(
                        "absolute inset-0 opacity-50",
                        `bg-gradient-to-br ${stat.bgGradient}`
                      )} />
                      <div className="relative flex items-center gap-4">
                        <div className={cn(
                          "flex-shrink-0 h-12 w-12 rounded-xl",
                          "bg-gradient-to-br shadow-sm",
                          stat.gradient
                        )}>
                          <stat.icon className="h-6 w-6 text-white m-3" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {stat.value}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Content by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.contentByType || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Users by Role
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Students', value: users.filter(u => u.role === 'student').length },
                              { name: 'Teachers', value: users.filter(u => u.role === 'teacher').length },
                              { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
                              { name: 'Super Admins', value: users.filter(u => u.role === 'super_admin').length }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            {[0, 1, 2, 3].map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Manage Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                    ))}
                  </div>
                ) : contents.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="h-16 w-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-zinc-400" />
                    </div>
                    <p className="text-zinc-500">No content uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contents.map((content) => (
                      <motion.div
                        key={content._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-4",
                          "border-zinc-200/50 dark:border-zinc-800/50",
                          "bg-zinc-50/50 dark:bg-zinc-800/30",
                          "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50",
                          "transition-all duration-200"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{content.title}</h3>
                            <Badge variant="outline" className="rounded-lg">{content.type}</Badge>
                            <Badge 
                              variant={content.isActive ? "default" : "secondary"}
                              className={cn(
                                "rounded-lg",
                                content.isActive && "bg-emerald-500 text-white"
                              )}
                            >
                              {content.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {content.branch} | Sem {content.semester} | {content.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(content)}
                            className="rounded-lg"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingContent(content)}
                            className="rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(content._id)}
                            className="rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'upload' && (
            <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Upload New Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter content title"
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject *</label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., Database Systems"
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description *</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter content description"
                      rows={3}
                      required
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                      >
                        {CONTENT_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch *</label>
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                      >
                        {BRANCHES.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Semester *</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                      >
                        {SEMESTERS.map((sem) => (
                          <option key={sem.id} value={sem.id}>{sem.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Enter tags separated by commas"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">File *</label>
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      className="w-full"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isUploading} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                    {isUploading ? 'Uploading...' : 'Upload Content'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'gallery' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Upload Gallery Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGalleryUpload} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title *</label>
                      <Input
                        value={galleryFormData.title}
                        onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                        placeholder="Enter image title"
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                      <Textarea
                        value={galleryFormData.description}
                        onChange={(e) => setGalleryFormData({ ...galleryFormData, description: e.target.value })}
                        placeholder="Enter image description"
                        rows={3}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Image *</label>
                      <input
                        type="file"
                        onChange={handleGalleryFileChange}
                        className="w-full"
                        accept="image/*"
                        required
                      />
                      {previewImage && (
                        <div className="relative mt-2">
                          <img src={previewImage} alt="Preview" className="h-40 w-full object-cover rounded-xl" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                            onClick={() => {
                              setPreviewImage(null);
                              setGalleryFormData({ ...galleryFormData, file: null });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={isUploading} className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25">
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      <Image className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    Gallery Images ({galleryItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {galleryItems.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <Image className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-zinc-500">No gallery images yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                      {galleryItems.map((item) => (
                        <div key={item._id} className="relative group rounded-xl overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-32 w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setEditingGallery(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => handleDeleteGallery(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs truncate mt-1 px-1">{item.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Create New Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEventUpload} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title *</label>
                      <Input
                        value={eventFormData.title}
                        onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                        placeholder="Enter event title"
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                      <Textarea
                        value={eventFormData.description}
                        onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                        placeholder="Enter event description"
                        rows={3}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date *</label>
                        <Input
                          type="date"
                          value={eventFormData.date}
                          onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
                        <Input
                          value={eventFormData.location}
                          onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                          placeholder="Event location"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Registration Link</label>
                      <Input
                        value={eventFormData.link}
                        onChange={(e) => setEventFormData({ ...eventFormData, link: e.target.value })}
                        placeholder="https://..."
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cover Image</label>
                      <input
                        type="file"
                        onChange={handleEventFileChange}
                        className="w-full"
                        accept="image/*"
                      />
                      {previewEventImage && (
                        <div className="relative mt-2">
                          <img src={previewEventImage} alt="Preview" className="h-40 w-full object-cover rounded-xl" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                            onClick={() => {
                              setPreviewEventImage(null);
                              setEventFormData({ ...eventFormData, file: null });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={isUploading} className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                      {isUploading ? 'Creating...' : 'Create Event'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    Events ({events.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-zinc-500">No events created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {events.map((event) => (
                        <div key={event._id} className="border rounded-xl p-4 border-zinc-200/50 dark:border-zinc-800/50">
                          <div className="flex gap-4">
                            {event.imageUrl && (
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="h-20 w-32 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{event.title}</h3>
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{event.description}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => setEditingEvent(event)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => handleDeleteEvent(event._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                                {event.location && <span>{event.location}</span>}
                                {event.link && (
                                  <a
                                    href={event.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-500 hover:underline"
                                  >
                                    <LinkIcon className="h-3 w-3" />
                                    Link
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'pyq' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    Upload Question Paper
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePYQUpload} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title *</label>
                      <Input
                        value={pyqFormData.title}
                        onChange={(e) => setPyqFormData({ ...pyqFormData, title: e.target.value })}
                        placeholder="e.g., Database Systems - Final Exam 2024"
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject *</label>
                      <Input
                        value={pyqFormData.subject}
                        onChange={(e) => setPyqFormData({ ...pyqFormData, subject: e.target.value })}
                        placeholder="e.g., Database Systems"
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Year *</label>
                        <select
                          value={pyqFormData.year}
                          onChange={(e) => setPyqFormData({ ...pyqFormData, year: e.target.value })}
                          className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                        >
                          {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Exam Type *</label>
                        <select
                          value={pyqFormData.examType}
                          onChange={(e) => setPyqFormData({ ...pyqFormData, examType: e.target.value })}
                          className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                        >
                          <option value="midterm">Mid Term</option>
                          <option value="final">Final Exam</option>
                          <option value="quiz">Quiz</option>
                          <option value="assignment">Assignment</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch *</label>
                        <select
                          value={pyqFormData.branch}
                          onChange={(e) => setPyqFormData({ ...pyqFormData, branch: e.target.value })}
                          className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                        >
                          <option value="cs">Computer Science</option>
                          <option value="it">Information Technology</option>
                          <option value="ece">Electronics & Comm</option>
                          <option value="ee">Electrical</option>
                          <option value="me">Mechanical</option>
                          <option value="ce">Civil</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Semester *</label>
                        <select
                          value={pyqFormData.semester}
                          onChange={(e) => setPyqFormData({ ...pyqFormData, semester: e.target.value })}
                          className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                      <Textarea
                        value={pyqFormData.description}
                        onChange={(e) => setPyqFormData({ ...pyqFormData, description: e.target.value })}
                        placeholder="Optional description"
                        rows={2}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">PDF File *</label>
                      <input
                        type="file"
                        onChange={(e) => setPyqFormData({ ...pyqFormData, file: e.target.files?.[0] || null })}
                        className="w-full"
                        accept=".pdf"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isUploading} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25">
                      {isUploading ? 'Uploading...' : 'Upload Question Paper'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Question Papers ({pyqs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pyqs.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-zinc-500">No question papers uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {pyqs.map((pyq) => (
                        <div key={pyq._id} className="flex items-center justify-between rounded-xl border p-3 border-zinc-200/50 dark:border-zinc-800/50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="rounded-lg text-xs">{pyq.examType}</Badge>
                              <Badge variant="secondary" className="rounded-lg text-xs">{pyq.year}</Badge>
                            </div>
                            <p className="font-medium truncate text-zinc-900 dark:text-zinc-100">{pyq.title}</p>
                            <p className="text-sm text-zinc-500 truncate">{pyq.subject} | Sem {pyq.semester}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setEditingPYQ(pyq)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => handleDeletePYQ(pyq._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  User Management
                </CardTitle>
                <p className="text-sm text-zinc-500">Manage user roles and permissions</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs rounded-xl"
                  />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                  >
                    <option value="">All Roles</option>
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-zinc-500">
                        {searchQuery || filterRole ? 'No users match your filters' : 'No users found'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((u) => (
                        <div key={u._id} className="flex items-center justify-between rounded-xl border p-4 border-zinc-200/50 dark:border-zinc-800/50">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-zinc-950">
                              <AvatarImage src={u.avatar} alt={u.name} />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</p>
                                {getRoleBadge(u.role)}
                              </div>
                              <p className="text-sm text-zinc-500">{u.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(u)}
                            className="rounded-xl"
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Change Role
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {editingContent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <Card className="w-full max-w-lg mx-4 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Edit Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingContent.title}
                      onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingContent.description}
                      onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingContent.isActive}
                      onChange={(e) => setEditingContent({ ...editingContent, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingContent(null)} className="flex-1 rounded-xl">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {editingGallery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <Card className="w-full max-w-lg mx-4 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Edit2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Edit Gallery Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img src={editingGallery.imageUrl} alt={editingGallery.title} className="h-40 w-full object-cover rounded-xl" />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingGallery.title}
                      onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingGallery.description}
                      onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="galleryActive"
                      checked={editingGallery.isActive}
                      onChange={(e) => setEditingGallery({ ...editingGallery, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="galleryActive" className="text-sm">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateGallery} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingGallery(null)} className="flex-1 rounded-xl">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {editingEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <Card className="w-full max-w-lg mx-4 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Edit2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Edit Event
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingEvent.imageUrl && (
                    <img src={editingEvent.imageUrl} alt={editingEvent.title} className="h-40 w-full object-cover rounded-xl" />
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={editingEvent.date ? editingEvent.date.split('T')[0] : ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        value={editingEvent.location}
                        onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Registration Link</label>
                    <Input
                      value={editingEvent.link || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, link: e.target.value })}
                      placeholder="https://..."
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Cover Image</label>
                    <input
                      type="file"
                      onChange={(e) => setEditingEventFile(e.target.files?.[0] || null)}
                      className="w-full"
                      accept="image/*"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="eventActive"
                      checked={editingEvent.isActive}
                      onChange={(e) => setEditingEvent({ ...editingEvent, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="eventActive" className="text-sm">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateEvent} disabled={isUploading} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingEvent(null); setEditingEventFile(null); }} className="flex-1 rounded-xl">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {editingPYQ && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <Card className="w-full max-w-lg mx-4 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Edit2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    Edit Question Paper
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingPYQ.title}
                      onChange={(e) => setEditingPYQ({ ...editingPYQ, title: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={editingPYQ.subject}
                      onChange={(e) => setEditingPYQ({ ...editingPYQ, subject: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year</label>
                      <select
                        value={editingPYQ.year}
                        onChange={(e) => setEditingPYQ({ ...editingPYQ, year: parseInt(e.target.value) })}
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                      >
                        {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Exam Type</label>
                      <select
                        value={editingPYQ.examType}
                        onChange={(e) => setEditingPYQ({ ...editingPYQ, examType: e.target.value })}
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                      >
                        <option value="midterm">Mid Term</option>
                        <option value="final">Final Exam</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Branch</label>
                      <select
                        value={editingPYQ.branch}
                        onChange={(e) => setEditingPYQ({ ...editingPYQ, branch: e.target.value })}
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                      >
                        <option value="cs">CS</option>
                        <option value="it">IT</option>
                        <option value="ece">ECE</option>
                        <option value="ee">EE</option>
                        <option value="me">ME</option>
                        <option value="ce">CE</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <select
                      value={editingPYQ.semester}
                      onChange={(e) => setEditingPYQ({ ...editingPYQ, semester: parseInt(e.target.value) })}
                      className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingPYQ.description}
                      onChange={(e) => setEditingPYQ({ ...editingPYQ, description: e.target.value })}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pyqActive"
                      checked={editingPYQ.isActive}
                      onChange={(e) => setEditingPYQ({ ...editingPYQ, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="pyqActive" className="text-sm">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdatePYQ} disabled={isUploading} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingPYQ(null)} className="flex-1 rounded-xl">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <Card className="w-full max-w-lg mx-4 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <UserCog className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Change User Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-zinc-950">
                      <AvatarImage src={editingUser.avatar} alt={editingUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-semibold">
                        {editingUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{editingUser.name}</p>
                      <p className="text-sm text-zinc-500">{editingUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((role) => (
                        <button
                          key={role.value}
                          onClick={() => setEditingUser({ ...editingUser, role: role.value as UserData['role'] })}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all duration-200",
                            editingUser.role === role.value 
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" 
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                          )}
                        >
                          <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold", role.color)}>
                            {role.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdateUserRole} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1 rounded-xl">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
