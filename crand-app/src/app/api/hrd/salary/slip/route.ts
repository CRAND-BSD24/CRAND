import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "hrd") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const yearParam = parseInt(searchParams.get("year") || "0", 10);
    const monthParam = parseInt(searchParams.get("month") || "0", 10); // 1-12
    const otherIncomeParam = parseFloat(searchParams.get("otherIncome") || "0");

    if (!teacherId) {
      return NextResponse.json({ message: "teacherId is required" }, { status: 400 });
    }

    const now = new Date();
    const y = yearParam > 0 ? yearParam : now.getFullYear();
    const m = monthParam > 0 ? monthParam : now.getMonth() + 1; // 1-12
    // Periode slip: 26 bulan sebelumnya s/d 25 bulan berjalan (end exclusive 26 bulan berjalan)
    const periodStart = new Date(Date.UTC(y, m - 2, 26, 0, 0, 0));
    const periodEndExclusive = new Date(Date.UTC(y, m - 1, 26, 0, 0, 0));

    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Ambil data guru + user
    const teacherObjectId = new ObjectId(teacherId);

    const [teacher] = await db
      .collection("teachers")
      .aggregate([
        { $match: { _id: teacherObjectId } },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray();

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    // Gaji pokok terbaru
    const salaryDoc = await db
      .collection("teacher_salary")
      .find({ teacher_id: teacherObjectId })
      .sort({ updated_at: -1 })
      .limit(1)
      .toArray();
    const baseSalary = salaryDoc[0]?.base_salary || 0;

    // Hitung kehadiran bulan tsb
    const attendanceCount = await db.collection("attendance").countDocuments({
      teacher_id: teacherObjectId,
      type: "teacher",
      created_at: { $gte: periodStart, $lt: periodEndExclusive },
    });

    const ratePerAttendance = 10000;
    const attendanceAmount = attendanceCount * ratePerAttendance;
    const otherIncome = isNaN(otherIncomeParam) ? 0 : Math.max(0, otherIncomeParam);

    // Komponen pendapatan (sesuai tampilan slip)
    const income = {
      bisyarohPokok: baseSalary,
      kehadiran: attendanceAmount,
      tunjJabatan: 0,
      tunjFungsional: 0,
      tunjKeluarga: 0,
      tunjAsrama: 300000,
      tunjMakanLaundry: 750000,
      lainLain: otherIncome,
    };
    const totalPendapatan =
      income.bisyarohPokok +
      income.kehadiran +
      income.tunjJabatan +
      income.tunjFungsional +
      income.tunjKeluarga +
      income.tunjAsrama +
      income.tunjMakanLaundry +
      income.lainLain;

    // Komponen potongan: masukkan Tunj. Asrama dan Tunj. Makan & Laundry
    const deduction = {
      potTunjKeluarga: 0,
      potTunjAsrama: income.tunjAsrama,
      potTunjMakanLaundry: income.tunjMakanLaundry,
      potLainLain: 0,
    };
    const totalPotongan =
      deduction.potTunjKeluarga +
      deduction.potTunjAsrama +
      deduction.potTunjMakanLaundry +
      deduction.potLainLain;

    const netBisyaroh = totalPendapatan - totalPotongan;

    // Generate PDF Slip
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait in points
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (
      text: string,
      x: number,
      y: number,
      options?: { size?: number; color?: any; font?: any }
    ) => {
      page.drawText(text, {
        x,
        y,
        size: options?.size ?? 12,
        color: options?.color ?? rgb(0, 0, 0),
        font: options?.font ?? helvetica,
      });
    };

    const drawCenteredText = (
      text: string,
      y: number,
      options?: { size?: number; color?: any; font?: any }
    ) => {
      const size = options?.size ?? 12;
      const font = options?.font ?? helvetica;
      const textWidth = font.widthOfTextAtSize(text, size);
      const x = (page.getWidth() - textWidth) / 2;
      drawText(text, x, y, { ...options, size, font });
    };

    const pad2 = (n: number) => String(n).padStart(2, "0");
    const monthsId = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const prevMonthIndex = ((m - 2) % 12 + 12) % 12;
    const currMonthIndex = ((m - 1) % 12 + 12) % 12;
    const prevYear = new Date(Date.UTC(y, m - 2, 1)).getUTCFullYear();
    const currYear = new Date(Date.UTC(y, m - 1, 1)).getUTCFullYear();
    const periodLabel = `26 ${monthsId[prevMonthIndex]} ${prevYear} - 25 ${monthsId[currMonthIndex]} ${currYear}`;
    const daysCount = Math.round((periodEndExclusive.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

    // Helper untuk mengecilkan font jika melebar melebihi batas
    const fitText = (text: string, maxWidth: number, baseSize: number, font = helvetica) => {
      let size = baseSize;
      const width = (s: number) => font.widthOfTextAtSize(text, s);
      while (width(size) > maxWidth && size > 6) {
        size -= 0.5;
      }
      return size;
    };

    // Dimensi halaman
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Embed gambar header/footer dari public, ditempatkan rapat ke tepi
    const headerPath = path.join(process.cwd(), "public", "header.png");
    const footerPath = path.join(process.cwd(), "public", "footer.png");
    const headerBuf = fs.readFileSync(headerPath);
    const footerBuf = fs.readFileSync(footerPath);
    const headerImg = await pdfDoc.embedPng(headerBuf);
    const footerImg = await pdfDoc.embedPng(footerBuf);

    // Skala gambar agar lebar penuh dan menempel kiri/kanan
    const headerHeight = (headerImg.height / headerImg.width) * pageWidth;
    const footerHeight = (footerImg.height / footerImg.width) * pageWidth;
    // Header ditempel di sisi atas (y dari bawah)
    page.drawImage(headerImg, { x: 0, y: pageHeight - headerHeight, width: pageWidth, height: headerHeight });
    // Footer ditempel di sisi bawah
    page.drawImage(footerImg, { x: 0, y: 0, width: pageWidth, height: footerHeight });

    // Judul slip (tepat di bawah gambar header)
    let cursorY = pageHeight - headerHeight - 22;
    drawCenteredText("SLIP BISYAROH", cursorY, { size: 18, font: helveticaBold });
    cursorY -= 18;
    drawCenteredText(`PERIODE : ${periodLabel}  ( ${daysCount} HARI )`, cursorY, { size: 11, font: helvetica });

    // Info Pegawai (diletakkan di bawah judul) — titik dua diluruskan
    let infoY = cursorY - 30;
    const infoLabelX = 50;
    const infoColonX = 170;
    const infoValueX = 180;
    const infoRowGap = 20;
    const infoRow = (label: string, value: string) => {
      drawText(label, infoLabelX, infoY, { size: 12, font: helveticaBold });
      drawText(":", infoColonX, infoY, { size: 12, font: helveticaBold });
      drawText(value, infoValueX, infoY, { size: 12, font: helvetica });
      infoY -= infoRowGap;
    };
    infoRow("Nama Karyawan", `${teacher.user?.name ?? "-"}`);
    infoRow("Jabatan", `Guru Tahfizh`);
    infoRow("ID Karyawan", `${teacher.nip ?? teacher._id.toString()}`);
    infoRow("Departemen", `Tahfizh`);
    // Beri sedikit jarak sebelum grup Pendapatan
    infoY -= 12;

    // Rincian: Pendapatan
    // Rincian: Pendapatan (diposisikan relatif setelah info)
    const leftX = 60;
    // Background Pendapatan
    const incomeTitleY = infoY - 20;
    const rowGap = 20;
    const paddingTop = 12;
    // Sesuaikan padding bawah per kelompok (income lebih rapat)
    const incomePaddingBottom = 6;
    const potPaddingBottom = 12;
    const netPaddingBottom = 12;
    const incomeRows = 9; // 8 item + total
    const incomeBoxHeight = paddingTop + 18 + incomeRows * rowGap + incomePaddingBottom;
    const incomeBoxBottom = incomeTitleY - (incomeBoxHeight - paddingTop);
    page.drawRectangle({ x: 45, y: incomeBoxBottom, width: 505, height: incomeBoxHeight, color: rgb(0.94, 0.97, 1), borderColor: rgb(0.78, 0.88, 1), borderWidth: 1 });
    drawText("Pendapatan", leftX, incomeTitleY, { size: 12, font: helveticaBold });
    let yPos = incomeTitleY - rowGap;
    const formatNumber = (n: number) => n.toLocaleString("id-ID");
    const colonX = 340;
    const rpX = 420;
    const numberRight = 545; // batas kanan angka agar lurus dari atas ke bawah
    const row = (label: string, value: number, bold = false) => {
      drawText(label, leftX, yPos, { font: bold ? helveticaBold : helvetica });
      drawText(":", colonX, yPos, { font: bold ? helveticaBold : helvetica });
      drawText("Rp", rpX, yPos, { font: bold ? helveticaBold : helvetica });
      const numStr = formatNumber(value);
      const w = (bold ? helveticaBold : helvetica).widthOfTextAtSize(numStr, 12);
      const numX = numberRight - w;
      drawText(numStr, numX, yPos, { font: bold ? helveticaBold : helvetica });
      yPos -= rowGap;
    };

    row("Bisyaroh Pokok", income.bisyarohPokok);
    row("Kehadiran", income.kehadiran);
    row("Tunj. Jabatan", income.tunjJabatan);
    row("Tunjangan Fungsional", income.tunjFungsional);
    row("Tunjangan Keluarga", income.tunjKeluarga);
    row("Tunj. Asrama", income.tunjAsrama);
    row("Tunj. Makan & Laundry", income.tunjMakanLaundry);
    row("Lain - Lain", income.lainLain);

    row("Total Pendapatan", totalPendapatan, true);

    // Potongan dengan background
    yPos -= 40;
    const potTitleY = yPos;
    const potRows = 5; // 4 item + total
    const potBoxHeight = paddingTop + 18 + potRows * rowGap + potPaddingBottom;
    const potBoxBottom = potTitleY - (potBoxHeight - paddingTop);
    page.drawRectangle({ x: 45, y: potBoxBottom, width: 505, height: potBoxHeight, color: rgb(0.94, 0.97, 1), borderColor: rgb(0.78, 0.88, 1), borderWidth: 1 });
    drawText("Potongan", 60, potTitleY, { size: 12, font: helveticaBold });
    yPos = potTitleY - rowGap;
    row("Tunj. Keluarga", deduction.potTunjKeluarga);
    row("Tunj. Asrama", deduction.potTunjAsrama);
    row("Tunj. Makan & Laundry", deduction.potTunjMakanLaundry);
    row("Lain - Lain", deduction.potLainLain);

    row("Total Potongan", totalPotongan, true);

    // Net Bisyaroh dengan background
    // Pisahkan background Net Bisyaroh dari Potongan
    const betweenGroupGap = 16;
    const netBoxHeight = paddingTop + 18 + 1 * rowGap + netPaddingBottom;
    // Posisi top net di bawah bottom pot dengan jarak tetap
    let desiredNetTop = potBoxBottom - betweenGroupGap;
    let netBoxBottom = desiredNetTop - netBoxHeight;
    // Pastikan tidak menutupi footer — minimal di atas tinggi footer + sedikit margin
    const footerMargin = 8;
    netBoxBottom = Math.max(footerHeight + footerMargin, netBoxBottom);
    page.drawRectangle({ x: 45, y: netBoxBottom, width: 505, height: netBoxHeight, color: rgb(0.94, 0.97, 1), borderColor: rgb(0.78, 0.88, 1), borderWidth: 1 });
    // Reposisi judul dan nilai sesuai posisi top box
    const netTop = netBoxBottom + netBoxHeight;
    yPos = netTop - paddingTop;
    drawText("NET BISYAROH", leftX, yPos, { size: 12, font: helveticaBold });
    drawText(":", colonX, yPos, { font: helveticaBold });
    drawText("Rp", rpX, yPos, { font: helveticaBold });
    const netStr = formatNumber(netBisyaroh);
    const netW = helveticaBold.widthOfTextAtSize(netStr, 12);
    const netX = numberRight - netW;
    drawText(netStr, netX, yPos, { font: helveticaBold });

    // Footer persetujuan dan website sudah termasuk di gambar footer, tidak perlu ditulis ulang

    const pdfBytes = await pdfDoc.save();

    const fileName = `Slip-Gaji-${(teacher.user?.name || "Ustadz").replace(/\s+/g, "_")}-${y}-${pad2(m)}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating slip:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
