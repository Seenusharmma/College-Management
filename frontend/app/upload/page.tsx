'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONTENT_TYPES, BRANCHES, SEMESTERS } from '@/types';
import { Upload, FileText, X, Loader2, CloudUpload, FileCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="max-w-md mx-auto py-16">
          <Card className="p-8 text-center border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-950/30 dark:to-red-950/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Access Denied</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Only teachers can upload content. Please contact an administrator.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="rounded-xl"
            >
              Go Back
            </Button>
          </Card>
        </div>
      </div>
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
    if (!file) return <CloudUpload className="h-10 w-10 text-zinc-400" />;
    if (file.type.includes('pdf')) return <FileText className="h-10 w-10 text-red-500" />;
    return <FileCheck className="h-10 w-10 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8 sm:py-12"
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Upload Content
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-base">
              Share notes, assignments, PYQs, and more with your college
            </p>
          </div>

          <Card className={cn(
            "overflow-hidden",
            "border-zinc-200/50 dark:border-zinc-800/50",
            "bg-white/80 dark:bg-zinc-900/80",
            "backdrop-blur-sm"
          )}>
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    File Upload
                  </Label>
                  <div
                    className={cn(
                      "relative rounded-2xl border-2 border-dashed transition-all duration-300",
                      dragActive 
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" 
                        : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600",
                      file && "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer flex-col items-center justify-center p-8 sm:p-12"
                    >
                      {file ? (
                        <div className="flex flex-col items-center text-center">
                          <div className={cn(
                            "h-16 w-16 rounded-2xl mb-4 flex items-center justify-center",
                            "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
                          )}>
                            {getFileIcon()}
                          </div>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                            {file.name.length > 40 ? file.name.substring(0, 40) + '...' : file.name}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className={cn(
                            "h-16 w-16 rounded-2xl mb-4 flex items-center justify-center transition-colors duration-300",
                            dragActive 
                              ? "bg-indigo-100 dark:bg-indigo-900/30" 
                              : "bg-zinc-100 dark:bg-zinc-800"
                          )}>
                            <CloudUpload className={cn(
                              "h-10 w-10 transition-colors duration-300",
                              dragActive ? "text-indigo-500" : "text-zinc-400"
                            )} />
                          </div>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            PDF, JPG, PNG, GIF (max 50MB)
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
                        variant="ghost"
                        size="icon"
                        onClick={() => setFile(null)}
                        className="absolute right-3 top-3 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter content title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className={cn(
                      "h-11 rounded-xl",
                      "bg-zinc-50 dark:bg-zinc-800/50",
                      "border-zinc-200 dark:border-zinc-700",
                      "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the content..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className={cn(
                      "min-h-[100px] rounded-xl resize-none",
                      "bg-zinc-50 dark:bg-zinc-800/50",
                      "border-zinc-200 dark:border-zinc-700",
                      "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger className={cn(
                        "h-11 rounded-xl",
                        "bg-zinc-50 dark:bg-zinc-800/50",
                        "border-zinc-200 dark:border-zinc-700"
                      )}>
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
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Branch <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.branch}
                      onValueChange={(value) => setFormData({ ...formData, branch: value })}
                      required
                    >
                      <SelectTrigger className={cn(
                        "h-11 rounded-xl",
                        "bg-zinc-50 dark:bg-zinc-800/50",
                        "border-zinc-200 dark:border-zinc-700"
                      )}>
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
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Semester
                    </Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger className={cn(
                        "h-11 rounded-xl",
                        "bg-zinc-50 dark:bg-zinc-800/50",
                        "border-zinc-200 dark:border-zinc-700"
                      )}>
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
                    <Label htmlFor="subject" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Data Structures"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className={cn(
                        "h-11 rounded-xl",
                        "bg-zinc-50 dark:bg-zinc-800/50",
                        "border-zinc-200 dark:border-zinc-700",
                        "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="e.g., important, midterm, chapter-1"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className={cn(
                      "h-11 rounded-xl",
                      "bg-zinc-50 dark:bg-zinc-800/50",
                      "border-zinc-200 dark:border-zinc-700",
                      "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    )}
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Separate tags with commas
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl font-medium h-11"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 rounded-xl font-medium h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
