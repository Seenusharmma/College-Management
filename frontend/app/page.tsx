import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-zinc-900 dark:text-zinc-50" />
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              AcademicHub
            </span>
          </Link>
          <div className="flex gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="container mx-auto">
          <div className="mx-auto mb-6 max-w-3xl space-y-4">
            <div className="flex justify-center">
              <GraduationCap className="h-12 w-12 text-zinc-900 dark:text-zinc-50" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              AcademicHub
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400 sm:text-lg md:text-xl">
              The modern, scalable platform for academic content sharing. 
              Replace WhatsApp chaos with organized, searchable, and secure content management.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:min-w-[180px]">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg" className="w-full sm:min-w-[180px]">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-100 py-12 px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <BookOpen className="mb-3 h-10 w-10 text-zinc-900 dark:text-zinc-50" />
              <h3 className="mb-2 text-lg font-semibold">Organized Content</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Notes, assignments, PYQs, events, and jobs - all categorized and searchable.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="mb-3 h-10 w-10 text-zinc-900 dark:text-zinc-50" />
              <h3 className="mb-2 text-lg font-semibold">Role-Based Access</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Students, teachers, and admins with appropriate permissions and controls.
              </p>
            </div>
            <div className="flex flex-col items-center text-center sm:col-span-2 lg:col-span-1">
              <Shield className="mb-3 h-10 w-10 text-zinc-900 dark:text-zinc-50" />
              <h3 className="mb-2 text-lg font-semibold">Secure & Scalable</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enterprise-grade security with Clerk authentication and Cloudinary storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        © 2024 AcademicHub. Built for modern colleges.
      </footer>
    </div>
  );
}
