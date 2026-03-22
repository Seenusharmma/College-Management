import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { User } from '@/lib/mongodb-user';
import { connectDB } from '@/lib/mongodb';
import AdminClient from './components/AdminClient';

const ADMIN_EMAILS = [
  'roshansharma404error@gmail.com',
  'admin@academichub.com'
];

async function checkIsSuperAdmin(userId: string): Promise<{ email: string; isSuperAdmin: boolean }> {
  try {
    await connectDB();
    
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    
    const dbUser = await User.findOne({ clerkUserId: userId });
    
    if (dbUser?.role === 'super_admin') {
      return { email, isSuperAdmin: true };
    }
    
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      return { email, isSuperAdmin: true };
    }
    
    return { email, isSuperAdmin: false };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { email: '', isSuperAdmin: false };
  }
}

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin');
  }

  const { email, isSuperAdmin } = await checkIsSuperAdmin(userId);

  return <AdminClient userEmail={email} isSuperAdmin={isSuperAdmin} />;
}
