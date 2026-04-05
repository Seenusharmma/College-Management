'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONTENT_TYPES, BRANCHES, SEMESTERS } from '@/types';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const router = useRouter();
  const { isTeacher } = useUserStore();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    branch: '',
    semester: '',
    subject: '',
    tags: ''
  });

  if (!isTeacher()) {
    return (
      <Card className="mx-auto max-w-md py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <FileText className="mb-4 h-12 w-12 text-zinc-400" />
          <h3 className="mb-2 text-lg font-semibold">Access Denied</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Only teachers can upload content. Please contact an administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Only PDF and images are allowed.');
      return;
    }
    
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!formData.type) {
      toast.error('Please select a content type');
      return;
    }

    if (!formData.branch) {
      toast.error('Please select a branch');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('type', formData.type);
    data.append('branch', formData.branch);
    data.append('semester', formData.semester || '0');
    data.append('subject', formData.subject.trim());
    if (formData.tags.trim()) {
      data.append('tags', formData.tags.trim());
    }

    try {
      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Content uploaded successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Failed to upload content. Please try again.');
      }
    } catch (err) {
      toast.error('Failed to upload content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-zinc-400" />;
    if (file.type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Upload Content</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Share notes, assignments, PYQs, and more with your college
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Content Details</CardTitle>
          <CardDescription className="text-sm">
            Fill in the details and upload your file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <div
                className={`relative ${
                  dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label
                  htmlFor="file-upload"
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 sm:h-32"
                >
                  {file ? (
                    <div className="flex flex-col items-center px-2">
                      {getFileIcon()}
                      <span className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:mt-2 sm:text-sm">
                        {file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center px-2">
                      <Upload className="mb-1 h-6 w-6 text-zinc-400 sm:mb-2 sm:h-8 sm:w-8" />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-zinc-400">
                        PDF, JPG, PNG (max 50MB)
                      </span>
                    </div>
                  )}
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      />
                </label>
                {file && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFile(null)}
                    className="absolute right-2 top-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter content title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the content..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => setFormData({ ...formData, branch: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Semesters</SelectItem>
                    {SEMESTERS.map((sem) => (
                      <SelectItem key={sem.id} value={String(sem.id)}>
                        {sem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="e.g., important, midterm, chapter-1"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="text-xs text-zinc-500">Separate tags with commas</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
