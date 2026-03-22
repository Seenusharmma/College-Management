'use client';

import { useEffect, useState, useMemo } from 'react';
import { useContentStore } from '@/hooks/useContent';
import { ContentCard, SearchFilters, Pagination } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { downloadFile } from '@/lib/download-file';
import { toast } from 'sonner';

export default function SearchPage() {
  const { contents, filters, setFilters, pagination, fetchContents, isLoading } = useContentStore();
  const [localFilters, setLocalFilters] = useState<{
    search?: string;
    type?: string;
    branch?: string;
    semester?: number;
  }>({
    search: '',
    type: undefined,
    branch: undefined,
    semester: undefined
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const filteredContents = useMemo(() => {
    let result = [...contents];
    
    if (localFilters.search) {
      const searchLower = localFilters.search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.subject.toLowerCase().includes(searchLower) ||
        c.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    if (localFilters.type) {
      result = result.filter(c => c.type === localFilters.type);
    }
    
    if (localFilters.branch) {
      result = result.filter(c => c.branch === localFilters.branch);
    }
    
    if (localFilters.semester) {
      result = result.filter(c => c.semester === localFilters.semester);
    }
    
    return result;
  }, [contents, localFilters]);

  const handleFilterChange = (newFilters: typeof localFilters) => {
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Content</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Find notes, assignments, PYQs, events, and jobs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilters filters={localFilters} onFilterChange={handleFilterChange} />
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Results ({filteredContents.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
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
        ) : filteredContents.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <FileText className="mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-lg font-semibold">No results found</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContents.map((content) => (
                <ContentCard
                  key={content._id}
                  content={content}
                  onDownload={handleDownload}
                />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
