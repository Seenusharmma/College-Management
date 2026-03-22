import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { User } from '@/lib/mongodb-user';
import { connectDB } from '@/lib/mongodb';

const ADMIN_EMAILS = [
  'roshansharma404error@gmail.com',
  'admin@academichub.com'
];

async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const dbUser = await User.findOne({ clerkUserId: userId });
    
    if (dbUser?.role === 'super_admin') {
      return true;
    }
    
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const query: Record<string, unknown> = { isActive: true };
    if (role) query.role = role;

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

    const data = users.map(u => ({
      _id: u._id.toString(),
      clerkUserId: u.clerkUserId,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      branch: u.branch,
      semester: u.semester,
      isActive: u.isActive,
      createdAt: u.createdAt?.toISOString(),
      updatedAt: u.updatedAt?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isSuperAdmin = await checkIsSuperAdmin(userId);
    
    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Only super admins can manage users' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { userId: targetUserId, role, isActive } = body;

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { clerkUserId: targetUserId },
      { 
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id.toString(),
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
