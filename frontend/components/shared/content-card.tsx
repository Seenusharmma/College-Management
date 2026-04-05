'use client';

import { Content } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDate, cn } from '@/lib/utils';
import { FileText, Download, Eye, Bookmark, Calendar, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ContentCardProps {
  content: Content;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  onDownload?: (content: Content) => void;
}

const typeColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  notes: { 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    text: 'text-blue-600 dark:text-blue-400', 
    border: 'border-blue-200 dark:border-blue-800/50',
    gradient: 'from-blue-500 to-blue-600'
  },
  assignments: { 
    bg: 'bg-green-50 dark:bg-green-950/30', 
    text: 'text-green-600 dark:text-green-400', 
    border: 'border-green-200 dark:border-green-800/50',
    gradient: 'from-green-500 to-green-600'
  },
  pyqs: { 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    text: 'text-purple-600 dark:text-purple-400', 
    border: 'border-purple-200 dark:border-purple-800/50',
    gradient: 'from-purple-500 to-purple-600'
  },
  events: { 
    bg: 'bg-orange-50 dark:bg-orange-950/30', 
    text: 'text-orange-600 dark:text-orange-400', 
    border: 'border-orange-200 dark:border-orange-800/50',
    gradient: 'from-orange-500 to-orange-600'
  },
  jobs: { 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    text: 'text-red-600 dark:text-red-400', 
    border: 'border-red-200 dark:border-red-800/50',
    gradient: 'from-red-500 to-red-600'
  },
  other: { 
    bg: 'bg-zinc-50 dark:bg-zinc-800/30', 
    text: 'text-zinc-600 dark:text-zinc-400', 
    border: 'border-zinc-200 dark:border-zinc-700/50',
    gradient: 'from-zinc-500 to-zinc-600'
  }
};

export function ContentCard({ content, onBookmark, isBookmarked, onDownload }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const colors = typeColors[content.type] || typeColors.other;
  
  const hasFile = content.fileUrl && content.fileUrl !== '#' && content.fileUrl !== '';

  const handleDownload = async () => {
    if (!hasFile) return;
    
    setIsDownloading(true);
    try {
      await onDownload?.(content);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const handleView = () => {
    if (!hasFile) return;
    window.open(content.fileUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        "border-zinc-200/50 dark:border-zinc-800/50",
        "bg-white/80 dark:bg-zinc-900/80",
        "backdrop-blur-sm",
        "hover:shadow-lg hover:shadow-zinc-950/10 dark:hover:shadow-zinc-950/20",
        "hover:border-indigo-200 dark:hover:border-indigo-800/50"
      )}>
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          colors.gradient
        )} />

        <div className="p-3 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge 
                className={cn(
                  colors.bg,
                  colors.text,
                  "border-0 font-semibold text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1",
                  "shadow-sm"
                )}
              >
                {content.type.toUpperCase()}
              </Badge>
              <span className={cn(
                "text-[10px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              )}>
                {content.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 rounded-lg transition-all duration-200 flex-shrink-0",
                isBookmarked 
                  ? "text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" 
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50"
              )}
              onClick={() => onBookmark?.(content._id)}
            >
              <Bookmark
                className={cn(
                  "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200",
                  isBookmarked && "fill-current scale-110"
                )}
              />
            </Button>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {content.title}
          </h3>
          
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
            {content.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md",
              "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30",
              "text-indigo-600 dark:text-indigo-400",
              "border border-indigo-100 dark:border-indigo-900/50"
            )}>
              {content.branch.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Sem {content.semester}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate max-w-[80px] sm:max-w-[100px]">
              {content.subject}
            </span>
          </div>

          <div className={cn(
            "flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500",
            "pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800"
          )}>
            {content.fileSize > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">{formatBytes(content.fileSize)}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {content.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {content.downloads || 0}
            </span>
            <span className="hidden sm:flex items-center gap-1 ml-auto">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(content.createdAt)}
            </span>
          </div>

          <div className="pt-3 sm:pt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleView}
              disabled={!hasFile}
              className={cn(
                "flex-1 h-10 sm:h-9 text-xs sm:text-sm font-medium transition-all duration-200",
                "border-zinc-200 dark:border-zinc-700",
                "hover:border-indigo-300 dark:hover:border-indigo-600",
                "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
                "hover:text-indigo-600 dark:hover:text-indigo-400",
                !hasFile && "opacity-50 cursor-not-allowed"
              )}
            >
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
              <span className="hidden xs:inline mr-1.5">View</span>
            </Button>
            <Button 
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading || !hasFile}
              className={cn(
                "flex-1 h-10 sm:h-9 text-xs sm:text-sm font-medium transition-all duration-200",
                hasFile ? [
                  "bg-gradient-to-r from-indigo-500 to-purple-500",
                  "hover:from-indigo-600 hover:to-purple-600",
                  "text-white shadow-lg shadow-indigo-500/25",
                  "hover:shadow-xl hover:shadow-indigo-500/30",
                ] : [
                  "bg-zinc-200 dark:bg-zinc-700",
                  "text-zinc-400 dark:text-zinc-500",
                  "cursor-not-allowed"
                ],
                "disabled:opacity-70"
              )}
            >
              {isDownloading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span className="hidden xs:inline">Downloading...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
                  <span className="hidden xs:inline">Download</span>
                  <span className="xs:hidden">Get</span>
                </>
              )}
            </Button>
          </div>
          
          {!hasFile && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-2">
              File not available
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
