import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  text,
  html,
  cc,
  bcc,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
}) {
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
      html,
      cc,
      bcc,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
