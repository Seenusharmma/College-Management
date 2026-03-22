'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CONTENT_TYPES, BRANCHES, SEMESTERS } from '@/types';

interface SearchFiltersProps {
  filters: {
    search?: string;
    type?: string;
    branch?: string;
    semester?: number;
  };
  onFilterChange: (filters: SearchFiltersProps['filters']) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search notes, assignments, PYQs..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((type) => (
              <Badge
                key={type.id}
                variant={filters.type === type.id ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  filters.type === type.id && 'bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900'
                )}
                onClick={() => onFilterChange({
                  ...filters,
                  type: filters.type === type.id ? undefined : type.id
                })}
              >
                {type.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Branch
          </label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((branch) => (
              <Badge
                key={branch.id}
                variant={filters.branch === branch.id ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  filters.branch === branch.id && 'bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900'
                )}
                onClick={() => onFilterChange({
                  ...filters,
                  branch: filters.branch === branch.id ? undefined : branch.id
                })}
              >
                {branch.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Semester
          </label>
          <div className="flex flex-wrap gap-2">
            {SEMESTERS.map((sem) => (
              <Badge
                key={sem.id}
                variant={filters.semester === sem.id ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  filters.semester === sem.id && 'bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900'
                )}
                onClick={() => onFilterChange({
                  ...filters,
                  semester: filters.semester === sem.id ? undefined : sem.id
                })}
              >
                {sem.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
