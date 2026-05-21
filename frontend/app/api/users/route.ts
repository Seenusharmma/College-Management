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
    
    let dbUser = await User.findOne({ clerkUserId: userId });
    
    if (!dbUser) {
      const email = await getUserEmail(userId);
      dbUser = await User.findOne({ email: email.toLowerCase() });
      
      if (dbUser) {
        dbUser.clerkUserId = userId;
        await dbUser.save();
      }
    }
    
    if (dbUser?.role === 'super_admin' || dbUser?.role === 'admin') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

async function getUserEmail(userId: string): Promise<string> {
  try {
    const dbUser = await User.findOne({ clerkUserId: userId });
    if (dbUser?.email) return dbUser.email;
    
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    return clerkUser.emailAddresses[0]?.emailAddress || '';
  } catch (error) {
    console.error('Error getting user email:', error);
    return '';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkIsSuperAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const query: Record<string, unknown> = {};
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

async function checkIsSuperAdminStrict(userId: string): Promise<boolean> {
  try {
    await connectDB();
    const dbUser = await User.findOne({ clerkUserId: userId });
    return dbUser?.role === 'super_admin';
  } catch {
    return false;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const email = await getUserEmail(userId);
    const isSuperAdmin = await checkIsSuperAdmin(userId);
    
    if (!isSuperAdmin && !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Only admins can manage users' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { userId: targetUserId, _id, role, isActive } = body;

    if (role === 'super_admin') {
      const isStrictSuperAdmin = await checkIsSuperAdminStrict(userId);
      if (!isStrictSuperAdmin) {
        return NextResponse.json({ success: false, error: 'Only super admins can assign the super_admin role' }, { status: 403 });
      }
    }

    const query: Record<string, unknown> = {};
    
    if (targetUserId) {
      query.clerkUserId = targetUserId;
    } else if (_id) {
      query._id = _id;
    } else {
      return NextResponse.json({ success: false, error: 'User ID or _id required' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      query,
      { 
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const email = await getUserEmail(userId);
    const isSuperAdmin = await checkIsSuperAdmin(userId);
    
    if (!isSuperAdmin && !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Only admins can create users' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { email: newUserEmail, name, role, branch, semester } = body;

    if (!newUserEmail || !name || !role) {
      return NextResponse.json({ success: false, error: 'Email, name and role are required' }, { status: 400 });
    }

    const allowedRoles = ['student', 'teacher', 'admin'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: newUserEmail });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const user = new User({
      clerkUserId: `manual_${Date.now()}`,
      email: newUserEmail,
      name,
      role,
      branch: branch || undefined,
      semester: semester ? parseInt(semester) : undefined,
      isActive: true
    });
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id.toString(),
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        isActive: user.isActive,
        createdAt: user.createdAt?.toISOString()
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
