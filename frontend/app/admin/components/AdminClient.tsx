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
  BarChart3, CheckCircle, XCircle, TrendingUp, Calendar, Shield, UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from '@/lib/download-file';
import { Content, CONTENT_TYPES, BRANCHES, SEMESTERS } from '@/types';
import Link from 'next/link';

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
  { value: 'student', label: 'Student', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'teacher', label: 'Teacher', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
];

interface AdminClientProps {
  userEmail: string;
  isSuperAdmin: boolean;
}

export default function AdminClient({ userEmail, isSuperAdmin }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'upload' | 'users'>('overview');
  const [contents, setContents] = useState<Content[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
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

  useEffect(() => {
    fetchContent();
    fetchStats();
    fetchUsers();
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleData?.color || ''}`}>
        {roleData?.label || role}
      </span>
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-zinc-500 mb-6">
              You need super admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage content, users, and monitor platform activity
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {userEmail}
          </Badge>
          <Badge variant="destructive">Super Admin</Badge>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {(['overview', 'content', 'upload', 'users'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="rounded-b-none"
          >
            {tab === 'overview' && <BarChart3 className="mr-2 h-4 w-4" />}
            {tab === 'content' && <FileText className="mr-2 h-4 w-4" />}
            {tab === 'upload' && <Upload className="mr-2 h-4 w-4" />}
            {tab === 'users' && <UserCog className="mr-2 h-4 w-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalContent || contents.length}</p>
                    <p className="text-xs text-zinc-500">Total Content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalStudents || users.length}</p>
                    <p className="text-xs text-zinc-500">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
                    <p className="text-xs text-zinc-500">Total Downloads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                    <Eye className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
                    <p className="text-xs text-zinc-500">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Content by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.contentByType || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Student Usage Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.recentActivity?.length ? stats.recentActivity : [
                    { date: 'Mon', uploads: 12, downloads: 45 },
                    { date: 'Tue', uploads: 8, downloads: 62 },
                    { date: 'Wed', uploads: 15, downloads: 78 },
                    { date: 'Thu', uploads: 10, downloads: 55 },
                    { date: 'Fri', uploads: 20, downloads: 95 },
                    { date: 'Sat', uploads: 5, downloads: 30 },
                    { date: 'Sun', uploads: 3, downloads: 20 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="uploads" name="Uploads" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="downloads" name="Downloads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Content</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                ))}
              </div>
            ) : contents.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                <p className="text-zinc-500">No content uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contents.map((content) => (
                  <div
                    key={content._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{content.title}</h3>
                        <Badge variant="outline">{content.type}</Badge>
                        <Badge variant={content.isActive ? 'default' : 'secondary'}>
                          {content.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">
                        {content.branch} | Sem {content.semester} | {content.subject}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {content.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" /> {content.downloads || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(content)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingContent(content)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(content._id)}
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
      )}

      {activeTab === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter content title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Database Systems"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter content description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch *</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {BRANCHES.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {SEMESTERS.map((sem) => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">File *</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  required
                />
              </div>

              <Button type="submit" disabled={isUploading} className="w-full">
                {isUploading ? 'Uploading...' : 'Upload Content'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Management
              </CardTitle>
              <p className="text-sm text-zinc-500">
                Manage user roles and permissions
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
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
                    <Users className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                    <p className="text-zinc-500">
                      {searchQuery || filterRole ? 'No users match your filters' : 'No users found'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredUsers.map((u) => (
                      <div key={u._id} className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback>{u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{u.name}</p>
                              {getRoleBadge(u.role)}
                            </div>
                            <p className="text-sm text-zinc-500">{u.email}</p>
                            {u.branch && (
                              <p className="text-xs text-zinc-400">
                                {u.branch.toUpperCase()} {u.semester && `| Semester ${u.semester}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(u)}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Edit Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingContent.description}
                  onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
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
                <Button onClick={handleUpdate} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingContent(null)} className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Change User Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={editingUser.avatar} alt={editingUser.name} />
                  <AvatarFallback>{editingUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{editingUser.name}</p>
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
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        editingUser.role === role.value 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateUserRole} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
