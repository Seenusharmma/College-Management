import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <div className="container px-4 md:px-6">
          <div className="mx-auto mb-8 max-w-3xl space-y-4">
            <div className="flex justify-center">
              <GraduationCap className="h-16 w-16 text-zinc-900 dark:text-zinc-50" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              AcademicHub
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 md:text-xl">
              The modern, scalable platform for academic content sharing. 
              Replace WhatsApp chaos with organized, searchable, and secure content management.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sign-in">
              <Button size="lg" className="min-w-[200px]">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-100 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <BookOpen className="mb-4 h-12 w-12 text-zinc-900 dark:text-zinc-50" />
              <h3 className="mb-2 text-xl font-semibold">Organized Content</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Notes, assignments, PYQs, events, and jobs - all categorized and searchable.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="mb-4 h-12 w-12 text-zinc-900 dark:text-zinc-50" />
              <h3 className="mb-2 text-xl font-semibold">Role-Based Access</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Students, teachers, and admins with appropriate permissions and controls.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="mb-4 h-12 w-12 text-zinc-900 dark:text-zinc-50" />
              <h3 className="mb-2 text-xl font-semibold">Secure & Scalable</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Enterprise-grade security with Clerk authentication and Cloudinary storage.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
