import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Content } from '@/lib/mongodb-content';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = { isActive: true };

    if (type) query.type = type;
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);
    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [contents, total] = await Promise.all([
      Content.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(query)
    ]);

    const data = contents.map(c => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: c.updatedAt?.toISOString() || new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
