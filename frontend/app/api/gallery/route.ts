import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Gallery } from '@/lib/mongodb-gallery';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();

    const galleries = await Gallery.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const data = galleries.map(g => ({
      _id: g._id.toString(),
      title: g.title,
      description: g.description,
      imageUrl: g.imageUrl,
      publicId: g.publicId,
      uploadedBy: g.uploadedBy,
      isActive: g.isActive,
      createdAt: g.createdAt?.toISOString(),
      updatedAt: g.updatedAt?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Failed to fetch gallery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery' },
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
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    
    if (!file || !title) {
      return NextResponse.json({ success: false, error: 'File and title are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadToCloudinary({
      buffer,
      originalname: file.name,
      mimetype: file.type
    });

    const gallery = new Gallery({
      title,
      description: description || '',
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      uploadedBy: userId
    });

    await gallery.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: gallery._id.toString(),
        title: gallery.title,
        description: gallery.description,
        imageUrl: gallery.imageUrl,
        publicId: gallery.publicId,
        uploadedBy: gallery.uploadedBy,
        isActive: gallery.isActive,
        createdAt: gallery.createdAt?.toISOString(),
        updatedAt: gallery.updatedAt?.toISOString()
      },
      message: 'Gallery image uploaded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Gallery upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}
