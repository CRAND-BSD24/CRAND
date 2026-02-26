import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { emailAddress, pdfBase64 } = req.body;

  if (!emailAddress || !pdfBase64) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER_NOTIFICATION,
      pass: process.env.EMAIL_PASSWORD_NOTIFICATION,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER_NOTIFICATION,
    to: emailAddress,
    subject: "Riwayat Hafalan",
    text: "Berikut adalah lampiran riwayat hafalan santri.",
    attachments: [
      {
        filename: "riwayat-hafalan.pdf",
        content: pdfBase64,
        encoding: "base64",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email berhasil dikirim." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengirim email." });
  }
}
