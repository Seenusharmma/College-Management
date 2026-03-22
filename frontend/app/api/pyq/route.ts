import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import PreviousYearQuestion from '@/lib/mongodb-pyq';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const subject = searchParams.get('subject');
    const examType = searchParams.get('examType');
    const limit = parseInt(searchParams.get('limit') || '100');

    await connectDB();

    const query: Record<string, unknown> = { isActive: true };

    if (year) query.year = parseInt(year);
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (examType) query.examType = examType;

    const questions = await PreviousYearQuestion.find(query)
      .sort({ year: -1, semester: 1, subject: 1 })
      .limit(limit)
      .lean();

    const total = await PreviousYearQuestion.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        data: questions,
        total,
        page: 1,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching PYQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch previous year questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const year = formData.get('year') as string;
    const examType = formData.get('examType') as string;
    const branch = formData.get('branch') as string;
    const semester = formData.get('semester') as string;
    const subject = formData.get('subject') as string;
    const file = formData.get('file') as File;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!title || !year || !examType || !branch || !semester || !subject || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'academichub/pyq';

    const signature = await getCloudinarySignature({
      timestamp,
      folder,
      apiKey: apiKey!,
      apiSecret: apiSecret!
    });

    const uploadFormData = new FormData();
    uploadFormData.append('file', new Blob([buffer]), file.name);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('folder', folder);
    uploadFormData.append('api_key', apiKey!);
    uploadFormData.append('signature', signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      {
        method: 'POST',
        body: uploadFormData
      }
    );

    if (!cloudinaryResponse.ok) {
      throw new Error('Failed to upload to Cloudinary');
    }

    const cloudinaryData = await cloudinaryResponse.json();

    const question = new PreviousYearQuestion({
      title,
      description: description || '',
      year: parseInt(year),
      examType,
      branch,
      semester: parseInt(semester),
      subject,
      fileUrl: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      fileType: file.type || 'application/pdf',
      uploadedBy: uploadedBy || 'Admin'
    });

    await question.save();

    return NextResponse.json({
      success: true,
      data: question,
      message: 'Question paper uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading PYQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload question paper' },
      { status: 500 }
    );
  }
}

async function getCloudinarySignature(params: { timestamp: number; folder: string; apiKey: string; apiSecret: string }) {
  const { timestamp, folder, apiKey, apiSecret } = params;
  
  const crypto = await import('crypto');
  
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');
  
  return signature;
}
