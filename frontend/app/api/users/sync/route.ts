import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { User } from '@/lib/mongodb-user';
import { connectDB } from '@/lib/mongodb';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    
    await connectDB();
    
    let user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        user.clerkUserId = userId;
        user.avatar = clerkUser.imageUrl;
        user.name = clerkUser.fullName || user.name;
        await user.save();
      } else {
        user = new User({
          clerkUserId: userId,
          email: email,
          name: clerkUser.fullName || 'Unknown',
          avatar: clerkUser.imageUrl,
          role: 'student'
        });
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id.toString(),
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
