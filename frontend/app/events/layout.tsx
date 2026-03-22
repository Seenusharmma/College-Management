'use client';

import { MainLayout } from '@/components/layout';

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
