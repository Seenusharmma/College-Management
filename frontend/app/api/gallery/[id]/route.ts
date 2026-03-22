import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Gallery } from '@/lib/mongodb-gallery';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { connectDB } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const gallery = await Gallery.findById(id).lean();
    
    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

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
      }
    });
  } catch (error) {
    console.error('Failed to fetch gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery item' },
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

    const gallery = await Gallery.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description,
        isActive: body.isActive
      },
      { new: true }
    ).lean();

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: gallery._id.toString(),
        title: gallery.title,
        description: gallery.description,
        imageUrl: gallery.imageUrl,
        isActive: gallery.isActive,
        createdAt: gallery.createdAt?.toISOString(),
        updatedAt: gallery.updatedAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to update gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery item' },
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

    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    try {
      await deleteFromCloudinary(gallery.publicId);
    } catch (cloudinaryError) {
      console.error('Failed to delete from Cloudinary:', cloudinaryError);
    }

    await Gallery.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
