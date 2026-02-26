import nodemailer from 'nodemailer';

export async function sendEmailWithPDF(
  to: string,
  subject: string,
  text: string,
  pdfBuffer: Buffer,
  studentName: string
) {
  try {
    if (!process.env.EMAIL_USER_NOTIFICATION || !process.env.EMAIL_PASSWORD_NOTIFICATION) {
      console.error('Email credentials not found in environment variables');
      return { success: false, error: 'Email credentials not found' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER_NOTIFICATION,
        pass: process.env.EMAIL_PASSWORD_NOTIFICATION,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER_NOTIFICATION,
      to,
      subject,
      text,
      attachments: [
        {
          filename: `Riwayat_Hafalan_${studentName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
} 