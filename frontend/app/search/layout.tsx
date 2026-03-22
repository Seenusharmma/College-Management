'use client';

import { MainLayout } from '@/components/layout';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
