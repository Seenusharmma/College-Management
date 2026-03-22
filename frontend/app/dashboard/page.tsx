'use client';

import { useEffect } from 'react';
import { useContentStore } from '@/hooks/useContent';
import { ContentCard, Pagination } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Eye, 
  Upload,
  ArrowRight
} from 'lucide-react';
import { downloadFile } from '@/lib/download-file';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { contents, filters, setFilters, pagination, fetchContents, isLoading } = useContentStore();
  const { isTeacher } = useUserStore();

  useEffect(() => {
    fetchContents();
  }, []);

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    fetchContents();
  };

  const handleDownload = async (content: typeof contents[0]) => {
    if (!content.fileUrl || content.fileUrl === '#') return;
    
    try {
      const filename = `${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.${content.fileType.split('/')[1] || 'pdf'}`;
      await downloadFile({ url: content.fileUrl, filename });
      useContentStore.getState().incrementDownloads(content._id);
    } catch {
      toast.error('Failed to download file');
    }
  };

  const totalViews = contents.reduce((acc, c) => acc + c.views, 0);
  const totalDownloads = contents.reduce((acc, c) => acc + c.downloads, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Browse and discover academic content
          </p>
        </div>
        {isTeacher() && (
          <Link href="/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Content
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Content</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contents.length}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Displayed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViews}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Views</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <Download className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDownloads}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Downloads</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Content</h2>
          <Link href="/search" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            View all <ArrowRight className="inline h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="mt-2 h-6 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contents.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <FileText className="mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-lg font-semibold">No content available</h3>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                {isTeacher() 
                  ? 'Upload content to get started!'
                  : 'No content has been uploaded yet. Check back later.'}
              </p>
              {isTeacher() && (
                <Link href="/upload">
                  <Button variant="outline">Upload Content</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((content) => (
                <ContentCard
                  key={content._id}
                  content={content}
                  onDownload={handleDownload}
                />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
