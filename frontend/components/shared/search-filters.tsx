'use client';

import { useState } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CONTENT_TYPES, BRANCHES, SEMESTERS } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFiltersProps {
  filters: {
    search?: string;
    type?: string;
    branch?: string;
    semester?: number;
  };
  onFilterChange: (filters: SearchFiltersProps['filters']) => void;
}

const typeColors: Record<string, string> = {
  notes: 'from-blue-500 to-cyan-500',
  assignments: 'from-green-500 to-emerald-500',
  pyqs: 'from-purple-500 to-pink-500',
  events: 'from-orange-500 to-amber-500',
  jobs: 'from-red-500 to-rose-500',
  other: 'from-zinc-500 to-neutral-500'
};

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    onFilterChange({ ...filters, search: localSearch });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFilterChange({});
  };

  const hasActiveFilters = filters.type || filters.branch || filters.semester || filters.search;
  const activeFiltersCount = [filters.type, filters.branch, filters.semester, filters.search].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className={cn(
            "absolute inset-0 rounded-xl blur transition-opacity duration-200",
            isFocused ? "opacity-100" : "opacity-0",
            hasActiveFilters ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20" : "bg-gradient-to-r from-zinc-500/20 to-zinc-500/20"
          )} />
          <div className="relative">
            <Search className={cn(
              "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-200",
              isFocused ? "text-indigo-500" : "text-zinc-400"
            )} />
            <Input
              placeholder="Search notes, assignments, PYQs..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "pl-12 h-12 rounded-xl text-base",
                "bg-zinc-50 dark:bg-zinc-800/50",
                "border-zinc-200 dark:border-zinc-700",
                "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              )}
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
        <Button 
          onClick={handleSearch}
          className={cn(
            "h-12 px-6 rounded-xl font-medium",
            "bg-gradient-to-r from-indigo-500 to-purple-500",
            "hover:from-indigo-600 hover:to-purple-600",
            "text-white shadow-lg shadow-indigo-500/25",
            "transition-all duration-200"
          )}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className={cn(
                "h-12 px-4 rounded-xl font-medium",
                "border-zinc-200 dark:border-zinc-700",
                "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
                "dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800"
              )}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-red-500">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((type) => {
              const isActive = filters.type === type.id;
              const gradient = typeColors[type.id] || typeColors.other;
              return (
                <Badge
                  key={type.id}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all duration-200 px-3 py-1.5 text-sm font-medium rounded-lg border",
                    isActive 
                      ? "bg-gradient-to-r text-white border-transparent shadow-lg"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                  )}
                  style={isActive ? {
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`
                  } as React.CSSProperties : undefined}
                  onClick={() => onFilterChange({
                    ...filters,
                    type: filters.type === type.id ? undefined : type.id
                  })}
                >
                  {isActive && <Sparkles className="h-3 w-3 mr-1.5" />}
                  {type.name}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Branch
          </label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((branch) => {
              const isActive = filters.branch === branch.id;
              return (
                <Badge
                  key={branch.id}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all duration-200 px-3 py-1.5 text-sm font-medium rounded-lg border",
                    isActive 
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                  )}
                  onClick={() => onFilterChange({
                    ...filters,
                    branch: filters.branch === branch.id ? undefined : branch.id
                  })}
                >
                  {branch.name}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Semester
          </label>
          <div className="flex flex-wrap gap-2">
            {SEMESTERS.map((sem) => {
              const isActive = filters.semester === sem.id;
              return (
                <Badge
                  key={sem.id}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all duration-200 px-3 py-1.5 text-sm font-medium rounded-lg border",
                    isActive 
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                  )}
                  onClick={() => onFilterChange({
                    ...filters,
                    semester: filters.semester === sem.id ? undefined : sem.id
                  })}
                >
                  {sem.name}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
