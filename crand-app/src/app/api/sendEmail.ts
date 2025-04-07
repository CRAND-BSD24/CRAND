import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { emailAddress, pdfBytes } = req.body;

    // Konfigurasi transporter NodeMailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // Ganti dengan layanan email yang Anda gunakan
      auth: {
        user: "buatgamingkali@gmail.com", // Ganti dengan email Anda
        pass: "ini passwor apake outh", // Ganti dengan password email Anda
      },
    });

    // Konversi pdfBytes menjadi Buffer
    const pdfBuffer = Buffer.from(pdfBytes);

    // Konfigurasi email
    const mailOptions = {
      from: "buatgamingkali@gmail.com",
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

    // Kirim email
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
