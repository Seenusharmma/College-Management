'use client';

import { MainLayout } from '@/components/layout';

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
