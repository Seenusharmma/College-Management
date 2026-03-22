import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Content } from '@/lib/mongodb-content';
import { connectDB } from '@/lib/mongodb';

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
    const type = formData.get('type') as string;
    const branch = formData.get('branch') as string;
    const semester = parseInt(formData.get('semester') as string) || 0;
    const subject = formData.get('subject') as string;
    const tagsString = formData.get('tags') as string;
    
    if (!file || !title || !description || !type || !branch || !subject) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadToCloudinary({
      buffer,
      originalname: file.name,
      mimetype: file.type
    });

    const content = new Content({
      title,
      description,
      type,
      branch,
      semester,
      subject,
      tags,
      fileUrl: uploadResult.url,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: userId
    });

    await content.save();

    return NextResponse.json({
      success: true,
      data: content,
      message: 'Content uploaded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}
