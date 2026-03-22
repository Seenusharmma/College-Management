'use client';

import { MainLayout } from '@/components/layout';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
