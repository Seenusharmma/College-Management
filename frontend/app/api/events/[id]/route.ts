import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Event } from '@/lib/mongodb-event';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { connectDB } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const event = await Event.findById(id).lean();
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date?.toISOString(),
        location: event.location,
        imageUrl: event.imageUrl,
        link: event.link,
        uploadedBy: event.uploadedBy,
        isActive: event.isActive,
        createdAt: event.createdAt?.toISOString(),
        updatedAt: event.updatedAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
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
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const location = formData.get('location') as string;
    const link = formData.get('link') as string;
    const file = formData.get('file') as File | null;
    const removeImage = formData.get('removeImage') === 'true';

    const updateData: Record<string, unknown> = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dateStr) updateData.date = new Date(dateStr);
    if (location !== undefined) updateData.location = location;
    if (link !== undefined) updateData.link = link;

    if (removeImage) {
      const existingEvent = await Event.findById(id);
      if (existingEvent?.imagePublicId) {
        try {
          await deleteFromCloudinary(existingEvent.imagePublicId);
        } catch (e) {
          console.error('Failed to delete old image:', e);
        }
      }
      updateData.imageUrl = undefined;
      updateData.imagePublicId = undefined;
    } else if (file) {
      const existingEvent = await Event.findById(id);
      if (existingEvent?.imagePublicId) {
        try {
          await deleteFromCloudinary(existingEvent.imagePublicId);
        } catch (e) {
          console.error('Failed to delete old image:', e);
        }
      }
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await uploadToCloudinary({
        buffer,
        originalname: file.name,
        mimetype: file.type
      });

      updateData.imageUrl = uploadResult.url;
      updateData.imagePublicId = uploadResult.publicId;
    }

    const event = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date?.toISOString(),
        location: event.location,
        imageUrl: event.imageUrl,
        link: event.link,
        uploadedBy: event.uploadedBy,
        isActive: event.isActive,
        createdAt: event.createdAt?.toISOString(),
        updatedAt: event.updatedAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
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

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.imagePublicId) {
      try {
        await deleteFromCloudinary(event.imagePublicId);
      } catch (e) {
        console.error('Failed to delete from Cloudinary:', e);
      }
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
