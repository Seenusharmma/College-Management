'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(page => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  const renderPageNumbers = () => {
    const elements = [];
    let lastPage = 0;

    for (const page of visiblePages) {
      if (page - lastPage > 1) {
        elements.push(
          <span key={`ellipsis-${page}`} className="px-2 text-zinc-400">
            ...
          </span>
        );
      }
      elements.push(
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'min-w-[2.5rem]',
            currentPage === page && 'bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900'
          )}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      );
      lastPage = page;
    }

    return elements;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      
      <div className="flex items-center gap-1">
        {renderPageNumbers()}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}
