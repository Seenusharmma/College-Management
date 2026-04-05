'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const getVisiblePages = () => {
    if (totalPages <= 7) return pages;
    
    const delta = 2;
    const range: (number | string)[] = [];
    
    range.push(1);
    
    if (currentPage - delta > 2) {
      range.push('...');
    }
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }
    
    range.push(totalPages);
    
    return range;
  };

  const visiblePages = getVisiblePages();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-1"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className={cn(
          "h-9 w-9 p-0 rounded-xl border-zinc-200 dark:border-zinc-800",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "disabled:opacity-40"
        )}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={cn(
          "h-9 w-9 p-0 rounded-xl border-zinc-200 dark:border-zinc-800",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "disabled:opacity-40"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1 mx-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span 
                key={`ellipsis-${index}`} 
                className="h-9 px-3 flex items-center text-zinc-400 dark:text-zinc-600"
              >
                •••
              </span>
            );
          }
          
          const isActive = currentPage === page;
          
          return (
            <motion.div
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "h-9 min-w-[2.5rem] px-3 rounded-xl font-medium transition-all duration-200",
                  isActive && [
                    "bg-gradient-to-r from-indigo-500 to-purple-500",
                    "hover:from-indigo-600 hover:to-purple-600",
                    "text-white shadow-lg shadow-indigo-500/25",
                    "border-0"
                  ],
                  !isActive && [
                    "border-zinc-200 dark:border-zinc-800",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "hover:border-indigo-200 dark:hover:border-indigo-800"
                  ]
                )}
              >
                {page}
              </Button>
            </motion.div>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={cn(
          "h-9 w-9 p-0 rounded-xl border-zinc-200 dark:border-zinc-800",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "disabled:opacity-40"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className={cn(
          "h-9 w-9 p-0 rounded-xl border-zinc-200 dark:border-zinc-800",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "disabled:opacity-40"
        )}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </motion.nav>
  );
}
