import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { User } from '@/lib/mongodb-user';
import { connectDB } from '@/lib/mongodb';
import AdminClient from './components/AdminClient';

const ADMIN_EMAILS = [
  'roshansharma404error@gmail.com',
  'admin@academichub.com'
];

async function checkAdminAccess(userId: string): Promise<{ email: string; isAdmin: boolean; userRole: string }> {
  try {
    await connectDB();
    
    // Try fetching email from Clerk — non-fatal if it fails
    let email = '';
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      email = clerkUser.emailAddresses[0]?.emailAddress || '';
    } catch {
      console.warn('Failed to fetch Clerk user, trying DB-only checks');
    }
    
    // Check hardcoded admin emails first (most reliable fallback)
    if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
      return { email, isAdmin: true, userRole: 'super_admin' };
    }
    
    let dbUser = await User.findOne({ clerkUserId: userId });
    
    if (!dbUser && email) {
      dbUser = await User.findOne({ email: email.toLowerCase() });
      
      if (dbUser) {
        dbUser.clerkUserId = userId;
        await dbUser.save();
      }
    }
    
    if (dbUser?.role === 'super_admin' || dbUser?.role === 'admin') {
      return { email, isAdmin: true, userRole: dbUser.role };
    }
    
    return { email, isAdmin: false, userRole: 'student' };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { email: '', isAdmin: false, userRole: 'student' };
  }
}

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin');
  }

  const { email, isAdmin, userRole } = await checkAdminAccess(userId);

  return <AdminClient userEmail={email} isAdmin={isAdmin} userRole={userRole} />;
}
