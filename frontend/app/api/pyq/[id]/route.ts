import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import PreviousYearQuestion from '@/lib/mongodb-pyq';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const question = await PreviousYearQuestion.findById(id).lean();

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching PYQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch question paper' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const question = await PreviousYearQuestion.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description,
        year: body.year,
        examType: body.examType,
        branch: body.branch,
        semester: body.semester,
        subject: body.subject,
        isActive: body.isActive
      },
      { new: true }
    );

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
      message: 'Question paper updated successfully'
    });
  } catch (error) {
    console.error('Error updating PYQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update question paper' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const question = await PreviousYearQuestion.findById(id);

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question paper not found' },
        { status: 404 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.round(Date.now() / 1000);

    const crypto = await import('crypto');
    const paramsToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    const deleteFormData = new FormData();
    deleteFormData.append('timestamp', timestamp.toString());
    deleteFormData.append('api_key', apiKey!);
    deleteFormData.append('signature', signature);

    await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`,
      {
        method: 'POST',
        body: deleteFormData
      }
    );

    await PreviousYearQuestion.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Question paper deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting PYQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete question paper' },
      { status: 500 }
    );
  }
}
