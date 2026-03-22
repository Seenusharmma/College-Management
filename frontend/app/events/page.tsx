'use client';

import { useEffect, useState } from 'react';
import { useContentStore } from '@/hooks/useContent';
import { ContentCard, Pagination } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store';
import Link from 'next/link';
import { Calendar, Clock, Users, Upload, ArrowRight } from 'lucide-react';
import { ContentFilters } from '@/types';
import { downloadFile } from '@/lib/download-file';
import { toast } from 'sonner';

export default function EventsPage() {
  const { contents, filters, setFilters, pagination, fetchContents, isLoading } = useContentStore();
  const { isTeacher } = useUserStore();
  const [localFilters, setLocalFilters] = useState<ContentFilters>({ type: 'events' });

  useEffect(() => {
    setLocalFilters({ type: 'events' });
    setFilters({ type: 'events' });
  }, []);

  const handleFilterChange = (newFilters: ContentFilters) => {
    const mergedFilters = { ...newFilters, type: 'events' };
    setLocalFilters(mergedFilters);
    setFilters(mergedFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
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

  const eventContents = contents.filter(c => c.type === 'events');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Stay updated with college events, workshops, and activities
          </p>
        </div>
        {isTeacher() && (
          <Link href="/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Post Event
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Events</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eventContents.length}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Displayed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Expected Attendees</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Events</h2>
          <Link href="/search" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Search Events <ArrowRight className="inline h-4 w-4" />
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
        ) : eventContents.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Calendar className="mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-lg font-semibold">No events posted yet</h3>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                {isTeacher() 
                  ? 'Post upcoming events for students to see!'
                  : 'Check back later for upcoming events'}
              </p>
              {isTeacher() && (
                <Link href="/upload">
                  <Button variant="outline">Post Event</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {eventContents.map((content) => (
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
