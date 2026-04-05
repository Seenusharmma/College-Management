'use client';

import { useEffect, useState, useMemo } from 'react';
import { useContentStore } from '@/hooks/useContent';
import { ContentCard, SearchFilters, Pagination } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Sparkles, TrendingUp, Filter } from 'lucide-react';
import { downloadFile } from '@/lib/download-file';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

  const activeFiltersCount = [localFilters.type, localFilters.branch, localFilters.semester].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8 sm:py-12"
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Search className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Search Content
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-base">
              Find notes, assignments, PYQs, events, and more
            </p>
          </div>

          <Card className={cn(
            "mb-8 overflow-hidden",
            "border-zinc-200/50 dark:border-zinc-800/50",
            "bg-white/80 dark:bg-zinc-900/80",
            "backdrop-blur-sm"
          )}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="rounded-lg">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </div>
              <SearchFilters filters={localFilters} onFilterChange={handleFilterChange} />
            </div>
          </Card>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Results
              </h2>
              <Badge variant="secondary" className="rounded-lg px-3">
                {filteredContents.length} found
              </Badge>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
              {localFilters.search && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  for "{localFilters.search}"
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="p-5 space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-6 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-5 w-14 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredContents.length === 0 ? (
            <Card className="py-16">
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  No results found
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Try adjusting your filters or search terms
                </p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredContents.map((content, index) => (
                  <motion.div
                    key={content._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ContentCard
                      content={content}
                      onDownload={handleDownload}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
