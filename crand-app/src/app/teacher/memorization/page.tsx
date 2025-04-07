"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BookText } from "lucide-react";
import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const MemorizationPage = () => {
  const [memorizationData, setMemorizationData] = useState([
    {
      name: "Ahmad Farhan",
      class: "10A",
      surah: "Al-Fatihah",
      progress: "5/7",
      status: "Baik",
      comment: "",
    },
    {
      name: "Fatimah Azzahra",
      class: "10A",
      surah: "Al-Baqarah",
      progress: "12/286",
      status: "Sangat Baik",
      comment: "",
    },
    {
      name: "Muhammad Rizky",
      class: "10A",
      surah: "Al-Fatihah",
      progress: "3/7",
      status: "Cukup",
      comment: "",
    },
  ]);

  const [newMemorization, setNewMemorization] = useState({
    name: "",
    class: "",
    surah: "",
    progress: "",
    status: "",
    comment: "",
  });

  const [showForm, setShowForm] = useState(false);

  const handleCommentChange = (index: number, newComment: string) => {
    const updatedData = [...memorizationData];
    updatedData[index].comment = newComment;
    setMemorizationData(updatedData);
  };

  const handleStatusChange = (index: number, newStatus: string) => {
    const updatedData = [...memorizationData];
    updatedData[index].status = newStatus;
    setMemorizationData(updatedData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewMemorization({ ...newMemorization, [name]: value });
  };

  const downloadPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 900]);
    const { width, height } = page.getSize();

    // Header
    page.drawText("LAPORAN HASIL HAFALAN", {
      x: width / 2 - 100,
      y: height - 50,
      size: 18,
      color: rgb(0, 0, 0),
    });

    // Tabel Hafalan
    const tableTop = height - 100;
    const rowHeight = 30;
    const colWidths = [100, 50, 100, 100, 100, 150];

    // Header tabel
    const headers = [
      "Nama Santri",
      "Kelas",
      "Surah",
      "Progress",
      "Status",
      "Keterangan",
    ];
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y: tableTop,
        size: 12,
        color: rgb(0, 0, 0),
      });
    });

    // Garis bawah header tabel
    page.drawLine({
      start: { x: 50, y: tableTop - 5 },
      end: { x: width - 50, y: tableTop - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Isi tabel
    memorizationData.forEach((student, index) => {
      const y = tableTop - (index + 1) * rowHeight;
      const row = [
        student.name,
        student.class,
        student.surah,
        student.progress,
        student.status,
        student.comment,
      ];
      row.forEach((text, i) => {
        page.drawText(text, {
          x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y,
          size: 10,
          color: rgb(0, 0, 0),
        });
      });

      // Garis bawah setiap baris
      page.drawLine({
        start: { x: 50, y: y - 5 },
        end: { x: width - 50, y: y - 5 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Rapor_Hafalan_Santri.pdf";
    link.click();
  };

  const sendPDF = async (emailAddress: string) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 900]);
    const { width, height } = page.getSize();

    // Header
    page.drawText("LAPORAN HASIL HAFALAN", {
      x: width / 2 - 100,
      y: height - 50,
      size: 18,
      color: rgb(0, 0, 0),
    });

    // Tabel Hafalan
    const tableTop = height - 100;
    const rowHeight = 30;
    const colWidths = [100, 50, 100, 100, 100, 150];

    // Header tabel
    const headers = [
      "Nama Santri",
      "Kelas",
      "Surah",
      "Progress",
      "Status",
      "Keterangan",
    ];
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y: tableTop,
        size: 12,
        color: rgb(0, 0, 0),
      });
    });

    // Garis bawah header tabel
    page.drawLine({
      start: { x: 50, y: tableTop - 5 },
      end: { x: width - 50, y: tableTop - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Isi tabel
    memorizationData.forEach((student, index) => {
      const y = tableTop - (index + 1) * rowHeight;
      const row = [
        student.name,
        student.class,
        student.surah,
        student.progress,
        student.status,
        student.comment,
      ];
      row.forEach((text, i) => {
        page.drawText(text, {
          x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y,
          size: 10,
          color: rgb(0, 0, 0),
        });
      });

      // Garis bawah setiap baris
      page.drawLine({
        start: { x: 50, y: y - 5 },
        end: { x: width - 50, y: y - 5 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();

    // Panggil API untuk mengirim email
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailAddress, pdfBytes }),
      });

      const textResponse = await response.text();
      console.log("Server response:", textResponse);

      const result = JSON.parse(textResponse);
      alert(result.message);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Gagal mengirim email. Silakan coba lagi.");
    }
  };

  const addMemorizationData = () => {
    setMemorizationData([...memorizationData, newMemorization]);
    setNewMemorization({
      name: "",
      class: "",
      surah: "",
      progress: "",
      status: "",
      comment: "",
    });
  };

  const toggleFormVisibility = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Hafalan</h1>
          <p className="text-gray-600">
            Kelola progress hafalan santri di kelas Anda
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={toggleFormVisibility}
        >
          <BookText className="mr-2 h-4 w-4" />
          Tambah Hafalan
        </Button>
        <div className="flex space-x-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => downloadPDF()}
          >
            Download PDF
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => sendPDF("geofannywewe@gmail.com")}
          >
            Send PDF
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Hafalan Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Surah</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memorizationData.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.surah}</TableCell>
                  <TableCell>{student.progress}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant={
                          student.status === "Lancar" ? "default" : "outline"
                        }
                        size="sm"
                        className="hover:bg-green-50"
                        onClick={() => handleStatusChange(index, "Lancar")}
                      >
                        Lancar
                      </Button>
                      <Button
                        variant={
                          student.status === "Tidak Lancar"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="hover:bg-red-50"
                        onClick={() =>
                          handleStatusChange(index, "Tidak Lancar")
                        }
                      >
                        Tidak Lancar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Tambahkan keterangan..."
                      value={student.comment}
                      onChange={(e) =>
                        handleCommentChange(index, e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={toggleFormVisibility}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Hafalan Baru</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Nama Santri"
              value={newMemorization.name}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="class"
              placeholder="Kelas"
              value={newMemorization.class}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="surah"
              placeholder="Surah"
              value={newMemorization.surah}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="progress"
              placeholder="Progress"
              value={newMemorization.progress}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="status"
              placeholder="Status"
              value={newMemorization.status}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <textarea
              name="comment"
              placeholder="Keterangan"
              value={newMemorization.comment}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                addMemorizationData();
                toggleFormVisibility();
              }}
            >
              Simpan Hafalan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemorizationPage;
