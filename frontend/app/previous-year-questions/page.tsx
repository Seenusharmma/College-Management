'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, Search, Filter, Calendar, BookOpen, 
  GraduationCap, X, ExternalLink, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from '@/lib/download-file';

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

const EXAM_TYPE_COLORS: Record<string, string> = {
  midterm: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  final: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  quiz: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  assignment: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
};

const EXAM_TYPE_LABELS: Record<string, string> = {
  midterm: 'Mid Term',
  final: 'Final',
  quiz: 'Quiz',
  assignment: 'Assignment'
};

const BRANCH_LABELS: Record<string, string> = {
  cs: 'CS',
  it: 'IT',
  ece: 'ECE',
  ee: 'EE',
  me: 'ME',
  ce: 'CE',
  all: 'All'
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Previous Year Questions</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Access past exam papers for effective preparation
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pyqs.length}</p>
                <p className="text-sm text-blue-100">Total Papers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueYears.length}</p>
                <p className="text-sm text-purple-100">Years</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(pyqs.map(p => p.subject)).size}</p>
                <p className="text-sm text-green-100">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(pyqs.map(p => `${p.branch}-${p.semester}`)).size}</p>
                <p className="text-sm text-orange-100">Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by subject, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter Options</CardTitle>
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
                  className="text-zinc-500"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {BRANCHES.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Type</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {EXAM_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <option value="all">All Years</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPYQs.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="mb-4 h-16 w-16 text-zinc-400" />
            <h3 className="mb-2 text-xl font-semibold">No papers found</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              {activeFiltersCount > 0 || searchQuery
                ? 'Try adjusting your filters or search query'
                : 'Previous year questions will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {uniqueYears.map((year) => (
            <div key={year}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl font-bold">{year}</h2>
                <Badge variant="secondary">{groupedByYear[year].length} papers</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupedByYear[year].map((pyq) => (
                  <Card 
                    key={pyq._id} 
                    className="overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={EXAM_TYPE_COLORS[pyq.examType]}>
                            {EXAM_TYPE_LABELS[pyq.examType]}
                          </Badge>
                          <Badge variant="outline">
                            {BRANCH_LABELS[pyq.branch]} - Sem {pyq.semester}
                          </Badge>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold mb-1 line-clamp-2">{pyq.title}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                        {pyq.subject}
                      </p>
                      
                      {pyq.description && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 line-clamp-2">
                          {pyq.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedPYQ(pyq)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(pyq)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPYQ && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedPYQ(null)}
        >
          <div 
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-2">
                <Badge className={EXAM_TYPE_COLORS[selectedPYQ.examType]}>
                  {EXAM_TYPE_LABELS[selectedPYQ.examType]}
                </Badge>
                <Badge variant="outline">
                  {BRANCH_LABELS[selectedPYQ.branch]} - Semester {selectedPYQ.semester}
                </Badge>
                <Badge variant="secondary">{selectedPYQ.year}</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPYQ(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <h2 className="mb-2 text-2xl font-bold">{selectedPYQ.title}</h2>
              
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{selectedPYQ.subject}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedPYQ.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Uploaded by {selectedPYQ.uploadedBy}</span>
                </div>
              </div>

              {selectedPYQ.description && (
                <div className="mb-6">
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    {selectedPYQ.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={() => handleDownload(selectedPYQ)}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <a
                  href={selectedPYQ.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <ExternalLink className="h-5 w-5" />
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
