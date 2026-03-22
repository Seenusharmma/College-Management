'use client';

import { MainLayout } from '@/components/layout';

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
