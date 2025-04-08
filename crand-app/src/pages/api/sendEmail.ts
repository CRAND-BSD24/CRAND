import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { emailAddress, pdfBase64 } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mrejaa@gmail.com',
        pass: 'szao idot pzoq vxbi'
      }
    });

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    const mailOptions = {
      from: "mrejaa@gmail.com",
      to: emailAddress,
      subject: "Rapor Hafalan Santri",
      text: "Berikut terlampir rapor hafalan santri dalam bentuk PDF.",
      attachments: [
        {
          filename: "Rapor_Hafalan_Santri.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email berhasil dikirim!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ message: "Gagal mengirim email. Silakan coba lagi." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
