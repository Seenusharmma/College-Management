import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Content } from '@/lib/mongodb-content';
import { connectDB } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const content = await Content.findById(id).lean();
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...content,
        _id: content._id.toString(),
        createdAt: content.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: content.updatedAt?.toISOString() || new Date().toISOString()
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const content = await Content.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description,
        isActive: body.isActive
      },
      { new: true }
    ).lean();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...content,
        _id: content._id.toString(),
        createdAt: content.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: content.updatedAt?.toISOString() || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to update content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const content = await Content.findByIdAndDelete(id);

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
