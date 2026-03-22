import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { User, UserRole } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    
    const userData: Partial<User> = {
      clerkUserId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.fullName || 'Unknown',
      avatar: clerkUser.imageUrl,
      role: UserRole.STUDENT
    };

    const response = await fetch(`${API_URL}/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to sync user');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
