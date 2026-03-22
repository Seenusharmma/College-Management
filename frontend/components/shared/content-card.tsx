'use client';

import { Content } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDate } from '@/lib/utils';
import { FileText, Download, Eye, Bookmark, Calendar } from 'lucide-react';

interface ContentCardProps {
  content: Content;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  onDownload?: (content: Content) => void;
}

const typeColors: Record<string, string> = {
  notes: 'bg-blue-500',
  assignments: 'bg-green-500',
  pyqs: 'bg-purple-500',
  events: 'bg-orange-500',
  jobs: 'bg-red-500',
  other: 'bg-zinc-500'
};

export function ContentCard({ content, onBookmark, isBookmarked, onDownload }: ContentCardProps) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge 
            className={`${typeColors[content.type]} text-white`}
          >
            {content.type.toUpperCase()}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onBookmark?.(content._id)}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
            />
          </Button>
        </div>
        <h3 className="line-clamp-2 font-semibold leading-tight">{content.title}</h3>
        <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {content.description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{content.branch.toUpperCase()}</Badge>
          <Badge variant="secondary">Sem {content.semester}</Badge>
          <Badge variant="outline">{content.subject}</Badge>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          {content.fileSize > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {formatBytes(content.fileSize)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {content.views || 0}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {content.downloads || 0}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Calendar className="h-3 w-3" />
          {formatDate(content.createdAt)}
        </div>
        <Button 
          size="sm" 
          onClick={() => onDownload?.(content)}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
