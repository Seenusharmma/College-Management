'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, Search, Filter, Calendar, BookOpen, 
  GraduationCap, X, ExternalLink, Clock, Sparkles, Layers, Award, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from '@/lib/download-file';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PYQ {
  _id: string;
  title: string;
  description: string;
  year: number;
  examType: string;
  branch: string;
  semester: number;
  subject: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
}

const BRANCHES = [
  { id: 'all', name: 'All Branches' },
  { id: 'cs', name: 'Computer Science' },
  { id: 'it', name: 'Information Technology' },
  { id: 'ece', name: 'Electronics & Comm' },
  { id: 'ee', name: 'Electrical' },
  { id: 'me', name: 'Mechanical' },
  { id: 'ce', name: 'Civil' }
];

const SEMESTERS = [
  { id: 'all', name: 'All Semesters' },
  { id: '1', name: 'Semester 1' },
  { id: '2', name: 'Semester 2' },
  { id: '3', name: 'Semester 3' },
  { id: '4', name: 'Semester 4' },
  { id: '5', name: 'Semester 5' },
  { id: '6', name: 'Semester 6' },
  { id: '7', name: 'Semester 7' },
  { id: '8', name: 'Semester 8' }
];

const EXAM_TYPES = [
  { id: 'all', name: 'All Exams' },
  { id: 'midterm', name: 'Mid Term' },
  { id: 'final', name: 'Final Exam' },
  { id: 'quiz', name: 'Quiz' },
  { id: 'assignment', name: 'Assignment' }
];

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

const EXAM_TYPE_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  midterm: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', icon: '📝' },
  final: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/50', icon: '🎯' },
  quiz: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800/50', icon: '⚡' },
  assignment: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50', icon: '📋' }
};

const EXAM_TYPE_LABELS: Record<string, string> = {
  midterm: 'Mid Term',
  final: 'Final',
  quiz: 'Quiz',
  assignment: 'Assignment'
};

export default function PYQPage() {
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedPYQ, setSelectedPYQ] = useState<PYQ | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPYQs();
  }, []);

  const fetchPYQs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBranch !== 'all') params.set('branch', selectedBranch);
      if (selectedSemester !== 'all') params.set('semester', selectedSemester);
      if (selectedExamType !== 'all') params.set('examType', selectedExamType);
      if (selectedYear !== 'all') params.set('year', selectedYear.toString());

      const response = await fetch(`/api/pyq?${params}`);
      const data = await response.json();
      if (data.success) {
        setPyqs(data.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch PYQs:', error);
      toast.error('Failed to load previous year questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPYQs();
  }, [selectedBranch, selectedSemester, selectedExamType, selectedYear]);

  const handleDownload = async (pyq: PYQ) => {
    try {
      const filename = `${pyq.subject.replace(/[^a-zA-Z0-9]/g, '_')}_${pyq.examType}_Sem${pyq.semester}_${pyq.year}.pdf`;
      await downloadFile({ url: pyq.fileUrl, filename });
      toast.success('Download started');
    } catch {
      toast.error('Failed to download file');
    }
  };

  const filteredPYQs = pyqs.filter(pyq => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pyq.title.toLowerCase().includes(query) ||
      pyq.subject.toLowerCase().includes(query) ||
      pyq.description?.toLowerCase().includes(query)
    );
  });

  const groupedByYear = filteredPYQs.reduce((acc, pyq) => {
    const year = pyq.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(pyq);
    return acc;
  }, {} as Record<number, PYQ[]>);

  const uniqueYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const activeFiltersCount = [
    selectedBranch !== 'all',
    selectedSemester !== 'all',
    selectedExamType !== 'all',
    selectedYear !== 'all'
  ].filter(Boolean).length;

  const stats = [
    { label: 'Total Papers', value: pyqs.length, icon: FileText, gradient: 'from-indigo-500 to-blue-500', bgGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30' },
    { label: 'Years Covered', value: uniqueYears.length, icon: Calendar, gradient: 'from-violet-500 to-purple-500', bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30' },
    { label: 'Subjects', value: new Set(pyqs.map(p => p.subject)).size, icon: BookOpen, gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' },
    { label: 'Courses', value: new Set(pyqs.map(p => `${p.branch}-${p.semester}`)).size, icon: GraduationCap, gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8 sm:py-12"
        >
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Previous Year Questions
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Access past exam papers for effective preparation
            </p>
          </div>

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
                      "flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl",
                      "bg-gradient-to-br shadow-sm",
                      stat.gradient
                    )}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white m-2 sm:m-3" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
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

          <Card className={cn(
            "mb-6 overflow-hidden",
            "border-zinc-200/50 dark:border-zinc-800/50",
            "bg-white/80 dark:bg-zinc-900/80",
            "backdrop-blur-sm"
          )}>
            <div className="flex flex-col gap-4 p-4 sm:p-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  placeholder="Search by subject, title, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-12 h-12 rounded-xl",
                    "bg-zinc-50 dark:bg-zinc-800/50",
                    "border-zinc-200 dark:border-zinc-700",
                    "focus:border-indigo-500 focus:ring-indigo-500/20",
                    "text-base"
                  )}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "gap-2 h-11 px-5 rounded-xl",
                  "border-zinc-200 dark:border-zinc-700",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  showFilters && "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="default"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-indigo-500"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Filter Options
                      </h3>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBranch('all');
                            setSelectedSemester('all');
                            setSelectedExamType('all');
                            setSelectedYear('all');
                          }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className={cn(
                            "w-full h-11 rounded-xl px-4",
                            "bg-zinc-50 dark:bg-zinc-800/50",
                            "border border-zinc-200 dark:border-zinc-700",
                            "focus:border-indigo-500 focus:ring-indigo-500/20",
                            "text-sm"
                          )}
                        >
                          {BRANCHES.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Semester</label>
                        <select
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                          className={cn(
                            "w-full h-11 rounded-xl px-4",
                            "bg-zinc-50 dark:bg-zinc-800/50",
                            "border border-zinc-200 dark:border-zinc-700",
                            "focus:border-indigo-500 focus:ring-indigo-500/20",
                            "text-sm"
                          )}
                        >
                          {SEMESTERS.map((sem) => (
                            <option key={sem.id} value={sem.id}>{sem.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Exam Type</label>
                        <select
                          value={selectedExamType}
                          onChange={(e) => setSelectedExamType(e.target.value)}
                          className={cn(
                            "w-full h-11 rounded-xl px-4",
                            "bg-zinc-50 dark:bg-zinc-800/50",
                            "border border-zinc-200 dark:border-zinc-700",
                            "focus:border-indigo-500 focus:ring-indigo-500/20",
                            "text-sm"
                          )}
                        >
                          {EXAM_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Year</label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                          className={cn(
                            "w-full h-11 rounded-xl px-4",
                            "bg-zinc-50 dark:bg-zinc-800/50",
                            "border border-zinc-200 dark:border-zinc-700",
                            "focus:border-indigo-500 focus:ring-indigo-500/20",
                            "text-sm"
                          )}
                        >
                          <option value="all">All Years</option>
                          {YEARS.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800 mb-4" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, j) => (
                      <Card key={j} className="animate-pulse h-40" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPYQs.length === 0 ? (
            <Card className="py-16">
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-6">
                  <Award className="h-10 w-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">No papers found</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                  {activeFiltersCount > 0 || searchQuery
                    ? 'Try adjusting your filters or search query'
                    : 'Previous year questions will appear here'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              {uniqueYears.map((year) => (
                <div key={year}>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 flex items-center gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{year.toString().slice(-2)}</span>
                      </div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{year}</h2>
                    </div>
                    <Badge variant="secondary" className="rounded-lg">
                      {groupedByYear[year].length} papers
                    </Badge>
                    <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
                  </motion.div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedByYear[year].map((pyq, index) => {
                      const examStyle = EXAM_TYPE_STYLES[pyq.examType] || EXAM_TYPE_STYLES.assignment;
                      return (
                        <motion.div
                          key={pyq._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className={cn(
                              "overflow-hidden cursor-pointer transition-all duration-300",
                              "border-zinc-200/50 dark:border-zinc-800/50",
                              "bg-white/80 dark:bg-zinc-900/80",
                              "backdrop-blur-sm",
                              "hover:shadow-xl hover:shadow-zinc-950/10",
                              "hover:border-indigo-200 dark:hover:border-indigo-800/50",
                              "hover:-translate-y-1"
                            )}
                            onClick={() => setSelectedPYQ(pyq)}
                          >
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge 
                                  className={cn(
                                    examStyle.bg,
                                    examStyle.text,
                                    "border font-medium text-xs px-2.5 py-1"
                                  )}
                                >
                                  {EXAM_TYPE_LABELS[pyq.examType]}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {pyq.branch.toUpperCase()} - Sem {pyq.semester}
                                </Badge>
                              </div>
                              
                              <h3 className="font-semibold mb-2 line-clamp-2 text-zinc-900 dark:text-zinc-100">
                                {pyq.title}
                              </h3>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                                {pyq.subject}
                              </p>
                              
                              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                  {pyq.uploadedBy}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(pyq);
                                  }}
                                  className={cn(
                                    "h-8 text-xs font-medium",
                                    "bg-gradient-to-r from-indigo-500 to-purple-500",
                                    "hover:from-indigo-600 hover:to-purple-600",
                                    "shadow-lg shadow-indigo-500/25"
                                  )}
                                >
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedPYQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedPYQ(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge className="bg-indigo-500 text-white text-[10px] sm:text-xs">
                    {EXAM_TYPE_LABELS[selectedPYQ.examType]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] sm:text-xs hidden xs:inline">
                    {selectedPYQ.branch.toUpperCase()} - Sem {selectedPYQ.semester}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] sm:text-xs xs:hidden">
                    {selectedPYQ.branch.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">{selectedPYQ.year}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPYQ(null)}
                  className="rounded-xl flex-shrink-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
              
              <div className="p-6">
                <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{selectedPYQ.title}</h2>
                
                <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>{selectedPYQ.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>{selectedPYQ.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Uploaded by {selectedPYQ.uploadedBy}</span>
                  </div>
                </div>

                {selectedPYQ.description && (
                  <div className="mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Description</h3>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      {selectedPYQ.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button 
                    size="lg" 
                    className={cn(
                      "flex-1 rounded-xl",
                      "bg-gradient-to-r from-indigo-500 to-purple-500",
                      "hover:from-indigo-600 hover:to-purple-600",
                      "shadow-lg shadow-indigo-500/25"
                    )}
                    onClick={() => handleDownload(selectedPYQ)}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                  <a
                    href={selectedPYQ.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700",
                      "px-6 py-3 font-medium transition-all duration-200",
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    )}
                  >
                    <ExternalLink className="h-5 w-5" />
                    Open in New Tab
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
