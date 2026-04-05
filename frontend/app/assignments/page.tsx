'use client';

import { useEffect, useState } from 'react';
import { useContentStore } from '@/hooks/useContent';
import { ContentCard, Pagination } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { FileText, Download, Eye, ArrowRight, Calendar, Sparkles, ClipboardCheck, CheckCircle, Inbox } from 'lucide-react';
import { ContentFilters } from '@/types';
import { downloadFile } from '@/lib/download-file';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AssignmentsPage() {
  const { contents, filters, setFilters, pagination, fetchContents, isLoading } = useContentStore();
  const [localFilters, setLocalFilters] = useState<ContentFilters>({ type: 'assignments' });

  useEffect(() => {
    setLocalFilters({ type: 'assignments' });
    setFilters({ type: 'assignments' });
  }, []);

  const handleFilterChange = (newFilters: ContentFilters) => {
    const mergedFilters = { ...newFilters, type: 'assignments' };
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

  const totalViews = contents.reduce((acc, c) => acc + c.views, 0);
  const totalDownloads = contents.reduce((acc, c) => acc + c.downloads, 0);
  const assignmentContents = contents.filter(c => c.type === 'assignments');

  const stats = [
    { 
      label: 'Total Assignments', 
      value: pagination.total, 
      icon: ClipboardCheck, 
      gradient: 'from-rose-500 to-red-500',
      bgGradient: 'from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30'
    },
    { 
      label: 'Displayed', 
      value: assignmentContents.length, 
      icon: Inbox, 
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30'
    },
    { 
      label: 'Total Views', 
      value: totalViews, 
      icon: Eye, 
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30'
    },
    { 
      label: 'Downloads', 
      value: totalDownloads, 
      icon: CheckCircle, 
      gradient: 'from-teal-500 to-cyan-500',
      bgGradient: 'from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-rose-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-rose-950/20 -mx-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 sm:py-12"
        >
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Assignments
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              View and download assignments from your teachers
            </p>
          </div>

          <a 
            href="/search" 
            className={cn(
              "group inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl mb-6 sm:mb-8",
              "bg-gradient-to-r from-rose-500 to-red-500",
              "text-white font-medium text-sm",
              "shadow-lg shadow-rose-500/25",
              "hover:from-rose-600 hover:to-red-600",
              "hover:shadow-xl hover:shadow-rose-500/30",
              "transition-all duration-300 w-full sm:w-auto justify-center"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Advanced Search
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "relative overflow-hidden p-3 sm:p-5",
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
                  <div className="relative flex items-center gap-2 sm:gap-4">
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl",
                      "bg-gradient-to-br shadow-sm",
                      stat.gradient
                    )}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white m-2 sm:m-3" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        {stat.value}
                      </p>
                      <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-base sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                All Assignments
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 via-zinc-300 to-transparent dark:from-zinc-800 dark:via-zinc-700" />
              <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {assignmentContents.length} items
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 sm:h-6 sm:w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-5 w-12 sm:h-6 sm:w-14 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 sm:h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 sm:h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-4 sm:h-5 w-14 sm:h-5 sm:w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : assignmentContents.length === 0 ? (
            <Card className="py-12 sm:py-16">
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-4 sm:mb-6">
                  <ClipboardCheck className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  No assignments available
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-sm sm:text-base">
                  Assignments from your teachers will appear here
                </p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                {assignmentContents.map((content, index) => (
                  <motion.div
                    key={content._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <ContentCard
                      content={content}
                      onDownload={handleDownload}
                    />
                  </motion.div>
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="mt-8 sm:mt-12 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
