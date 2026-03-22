'use client';

import { SignUp } from '@clerk/nextjs';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-10 w-10 text-zinc-900 dark:text-zinc-50" />
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            AcademicHub
          </span>
        </Link>
      </div>
      <SignUp />
    </div>
  );
}
