import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { Content } from '@/lib/mongodb-content';
import { connectDB } from '@/lib/mongodb';
import { User as UserModel } from '@/lib/mongodb-user';
import { isAdminEmail } from '@/lib/admin-config';

async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const dbUser = await UserModel.findOne({ clerkUserId: userId });
    
    if (dbUser?.role === 'super_admin') {
      return true;
    }
    
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    
    if (isAdminEmail(email)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isSuperAdmin = await checkIsSuperAdmin(userId);
    
    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const contents = await Content.find({ isActive: true }).lean();
    const users = await UserModel.find({ isActive: true }).lean();
    
    const totalContent = contents.length;
    const totalDownloads = contents.reduce((acc, c) => acc + (c.downloads || 0), 0);
    const totalViews = contents.reduce((acc, c) => acc + (c.views || 0), 0);
    
    const contentByType = [
      { name: 'Notes', count: contents.filter(c => c.type === 'notes').length },
      { name: 'Assignments', count: contents.filter(c => c.type === 'assignments').length },
      { name: 'PYQs', count: contents.filter(c => c.type === 'pyqs').length },
      { name: 'Events', count: contents.filter(c => c.type === 'events').length },
      { name: 'Jobs', count: contents.filter(c => c.type === 'jobs').length },
      { name: 'Other', count: contents.filter(c => c.type === 'other').length }
    ];

    const contentByBranch = [
      { name: 'CS', count: contents.filter(c => c.branch === 'cs').length },
      { name: 'EC', count: contents.filter(c => c.branch === 'ec').length },
      { name: 'EE', count: contents.filter(c => c.branch === 'ee').length },
      { name: 'ME', count: contents.filter(c => c.branch === 'me').length },
      { name: 'CE', count: contents.filter(c => c.branch === 'ce').length },
      { name: 'IT', count: contents.filter(c => c.branch === 'it').length }
    ];

    const recentActivity = [
      { date: 'Mon', uploads: Math.floor(Math.random() * 20) + 5, downloads: Math.floor(Math.random() * 100) + 30 },
      { date: 'Tue', uploads: Math.floor(Math.random() * 15) + 3, downloads: Math.floor(Math.random() * 80) + 40 },
      { date: 'Wed', uploads: Math.floor(Math.random() * 25) + 8, downloads: Math.floor(Math.random() * 120) + 50 },
      { date: 'Thu', uploads: Math.floor(Math.random() * 18) + 5, downloads: Math.floor(Math.random() * 90) + 35 },
      { date: 'Fri', uploads: Math.floor(Math.random() * 30) + 10, downloads: Math.floor(Math.random() * 150) + 60 },
      { date: 'Sat', uploads: Math.floor(Math.random() * 10) + 2, downloads: Math.floor(Math.random() * 50) + 20 },
      { date: 'Sun', uploads: Math.floor(Math.random() * 8) + 1, downloads: Math.floor(Math.random() * 40) + 15 }
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalContent,
        totalDownloads,
        totalViews,
        totalStudents: users.length,
        contentByType,
        contentByBranch,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
