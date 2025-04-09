import { NextResponse } from 'next/server';
import { sendEmailWithPDF } from '@/services/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailAddress, pdfBase64, studentName } = body;
    
    // Validasi input
    if (!emailAddress) {
      return NextResponse.json(
        { message: 'Email santri tidak tersedia' },
        { status: 400 }
      );
    }

    if (!pdfBase64) {
      return NextResponse.json(
        { message: 'Data PDF tidak tersedia' },
        { status: 400 }
      );
    }

    if (!studentName) {
      return NextResponse.json(
        { message: 'Nama santri tidak tersedia' },
        { status: 400 }
      );
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    const result = await sendEmailWithPDF(
      emailAddress,
      'Riwayat Hafalan Santri',
      `Berikut adalah riwayat hafalan santri ${studentName}.`,
      pdfBuffer,
      studentName
    );


    if (!result.success) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json(
      { message: 'Email berhasil dikirim' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Gagal mengirim email' },
      { status: 500 }
    );
  }
} 