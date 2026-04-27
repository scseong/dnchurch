import { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';
import { checkAdminPermission } from '@/actions/_auth-helpers';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export default async function Layout({ children }: PropsWithChildren) {
  const { isAdmin } = await checkAdminPermission();
  if (!isAdmin) redirect('/');

  return <AdminLayout>{children}</AdminLayout>;
}
