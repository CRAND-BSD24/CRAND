"use client";

import { useEffect, useState } from "react";
import {
  getMyBisyaroh,
  BisyarohSlip,
} from "@/app/teacher/bisyaroh/action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useSession } from "next-auth/react";

export default function EducatorBisyarohPage() {
  const [slips, setSlips] = useState<BisyarohSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchSlips() {
      try {
        const data = await getMyBisyaroh();
        setSlips(data);
      } catch (error) {
        console.error("Failed to fetch bisyaroh", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlips();
  }, []);

  const handleDownloadPdf = async (slip: BisyarohSlip) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const margin = 40;

    const drawText = (
      text: string,
      x: number,
      y: number,
      size = 12,
      bold = false
    ) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: bold ? fontBold : font,
      });
    };

    const formatNumber = (n: number) =>
      n.toLocaleString("id-ID", { minimumFractionDigits: 0 });

    const userName = session?.user?.name || "User";

    // Header box
    const headerHeight = 70;
    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - headerHeight,
      width: pageWidth - margin * 2,
      height: headerHeight,
      color: rgb(0.9, 0.97, 0.93),
    });

    let cursorY = pageHeight - margin - 24;
    const title = "SLIP BISYAROH";
    const titleSize = 18;
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
    const titleX = (pageWidth - titleWidth) / 2;
    drawText(title, titleX, cursorY, titleSize, true);

    cursorY -= 22;
    drawText(`Nama: ${userName}`, margin + 12, cursorY, 11);
    cursorY -= 16;
    drawText(
      `Periode: ${slip.month_name} ${slip.year}`,
      margin + 12,
      cursorY,
      11
    );

    // Info garis pemisah
    cursorY -= 24;
    page.drawLine({
      start: { x: margin, y: cursorY },
      end: { x: pageWidth - margin, y: cursorY },
      thickness: 1,
      color: rgb(0.8, 0.9, 0.85),
    });
    cursorY -= 18;
    drawText(`Tanggal: ${slip.date}`, margin, cursorY, 11);

    cursorY -= 28;

    const rightAmount = (value: number, y: number) => {
      const text = `Rp ${formatNumber(value)}`;
      const w = font.widthOfTextAtSize(text, 11);
      const x = pageWidth - margin - w;
      drawText(text, x, y, 11);
    };

    const incomeTotal = slip.details.income.reduce(
      (sum, it) => sum + it.amount,
      0
    );

    // Pendapatan box
    const incomeBoxTop = cursorY + 18;
    const incomeBoxHeight = 20 + (slip.details.income.length + 1) * 16 + 16;
    page.drawRectangle({
      x: margin,
      y: incomeBoxTop - incomeBoxHeight,
      width: pageWidth - margin * 2,
      height: incomeBoxHeight,
      color: rgb(0.96, 0.99, 0.97),
      borderColor: rgb(0.8, 0.9, 0.85),
      borderWidth: 1,
    });

    drawText("Pendapatan", margin + 8, cursorY, 12, true);
    cursorY -= 20;
    slip.details.income.forEach((i) => {
      drawText(i.name, margin + 16, cursorY, 11);
      rightAmount(i.amount, cursorY);
      cursorY -= 16;
    });
    drawText("Total Pendapatan", margin + 16, cursorY, 11, true);
    rightAmount(incomeTotal, cursorY);
    cursorY -= 28;

    const deductionTotal = slip.details.deduction.reduce(
      (sum, it) => sum + it.amount,
      0
    );

    // Potongan box
    const potBoxTop = cursorY + 18;
    const potRows = slip.details.deduction.length + 1;
    const potBoxHeight = 20 + potRows * 16 + 16;
    page.drawRectangle({
      x: margin,
      y: potBoxTop - potBoxHeight,
      width: pageWidth - margin * 2,
      height: potBoxHeight,
      color: rgb(0.99, 0.96, 0.96),
      borderColor: rgb(0.92, 0.8, 0.8),
      borderWidth: 1,
    });

    drawText("Potongan", margin + 8, cursorY, 12, true);
    cursorY -= 20;
    slip.details.deduction.forEach((d) => {
      drawText(d.name, margin + 16, cursorY, 11);
      rightAmount(d.amount, cursorY);
      cursorY -= 16;
    });
    drawText("Total Potongan", margin + 16, cursorY, 11, true);
    rightAmount(deductionTotal, cursorY);
    cursorY -= 30;

    // Penerimaan bersih highlight
    page.drawRectangle({
      x: margin,
      y: cursorY - 24,
      width: pageWidth - margin * 2,
      height: 24,
      color: rgb(0.9, 0.96, 0.9),
    });
    drawText("Penerimaan Bersih", margin + 12, cursorY - 8, 12, true);
    rightAmount(slip.total, cursorY - 8);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const rawName = `Slip Bisyaroh ${userName} ${slip.month_name} ${slip.year}.pdf`;
    const safeName = rawName.replace(/[\\/:*?"<>|]/g, "");
    a.download = safeName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const monthOptions = [
    { value: "all", label: "Semua Bulan" },
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const yearOptions = [
    "all",
    ...Array.from(new Set(slips.map((s) => s.year))),
  ];

  const filteredSlips = slips.filter((slip) => {
    const d = new Date(slip.date);
    const m = d.getMonth() + 1;
    const byMonth =
      selectedMonth === "all" || m === parseInt(selectedMonth, 10);
    const byYear =
      selectedYear === "all" || slip.year === selectedYear;
    return byMonth && byYear;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-blue-800">
        Memuat data bisyaroh...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-800 mb-1">
              Bisyaroh Saya
            </h1>
            <p className="text-slate-600 text-sm">
              Riwayat slip gaji dan bonus anda.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-40">
              <span className="text-[11px] text-slate-600">Bulan</span>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="h-9 text-sm border-blue-200 bg-white">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-blue-200 shadow-md">
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-32">
              <span className="text-[11px] text-slate-600">Tahun</span>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger className="h-9 text-sm border-blue-200 bg-white">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-blue-200 shadow-md">
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y === "all" ? "Semua Tahun" : y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSlips.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-blue-200 text-slate-500">
            Belum ada data bisyaroh yang diterbitkan.
          </div>
        ) : (
          filteredSlips.map((slip) => (
            <Card
              key={slip._id}
              className="border-blue-100 hover:shadow-md transition-shadow"
            >
              <CardHeader className="bg-blue-50/50 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      {slip.month_name} {slip.year}
                    </span>
                  </div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium capitalize">
                    {slip.status}
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 mt-2">
                  {formatCurrency(slip.total)}
                </CardTitle>
                <CardDescription className="text-xs">
                  Diterbitkan:{" "}
                  {new Date(slip.date).toLocaleDateString("id-ID")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 text-xs sm:text-sm mb-3">
                  <div>
                    <p className="font-semibold text-blue-800 mb-1">
                      Pendapatan
                    </p>
                    {slip.details.income.map((i) => (
                      <div
                        key={i.name}
                        className="flex justify-between gap-2"
                      >
                        <span className="text-slate-600">{i.name}</span>
                        <span className="font-medium text-blue-700">
                          {formatCurrency(i.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-rose-700 mb-1">
                      Potongan
                    </p>
                    {slip.details.deduction.map((d) => (
                      <div
                        key={d.name}
                        className="flex justify-between gap-2"
                      >
                        <span className="text-slate-600">{d.name}</span>
                        <span className="font-medium text-rose-700">
                          {formatCurrency(d.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-blue-200 pt-2 mt-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-semibold text-slate-700">
                        Penerimaan Bersih
                      </span>
                      <span className="font-bold text-blue-800">
                        {formatCurrency(slip.total)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleDownloadPdf(slip)}
                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
