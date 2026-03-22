import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Event } from '@/lib/mongodb-event';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find({ isActive: true })
      .sort({ date: -1 })
      .lean();

    const data = events.map(e => ({
      _id: e._id.toString(),
      title: e.title,
      description: e.description,
      date: e.date?.toISOString(),
      location: e.location,
      imageUrl: e.imageUrl,
      link: e.link,
      uploadedBy: e.uploadedBy,
      isActive: e.isActive,
      createdAt: e.createdAt?.toISOString(),
      updatedAt: e.updatedAt?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
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

    await connectDB();

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const location = formData.get('location') as string;
    const link = formData.get('link') as string;
    const file = formData.get('file') as File | null;
    
    if (!title || !dateStr) {
      return NextResponse.json({ success: false, error: 'Title and date are required' }, { status: 400 });
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await uploadToCloudinary({
        buffer,
        originalname: file.name,
        mimetype: file.type
      });

      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const event = new Event({
      title,
      description: description || '',
      date: new Date(dateStr),
      location: location || '',
      link: link || '',
      imageUrl,
      imagePublicId,
      uploadedBy: userId
    });

    await event.save();

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
      },
      message: 'Event created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create event' 
    }, { status: 500 });
  }
}
