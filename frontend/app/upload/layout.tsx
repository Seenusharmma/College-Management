'use client';

import { MainLayout } from '@/components/layout';

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
