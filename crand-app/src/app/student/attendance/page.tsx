'use client';

import React, { useState, useEffect } from 'react';
import { getAttendanceRecords } from './action';
import { AttendanceRecord } from './action';
import Link from 'next/link';
import Image from 'next/image';

export default function AttendanceHistoryPage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    const records = await getAttendanceRecords();
    setAttendanceRecords(records);
  };

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#9ACBD0] flex flex-col items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl border border-[#48A6A7]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#B5DAD6] text-[#004D4D]">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Waktu Absen</th>
                <th className="px-4 py-3 text-left">Foto</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record, index) => (
                <tr key={record._id} className="border-t hover:bg-[#f8fafa]">
                  <td className="px-4 py-3">{indexOfFirstRecord + index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-[#02676C]">
                    {record.name}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(record.timestamp).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative w-16 h-16">
                      <Image
                        src={`data:image/jpeg;base64,${record.photo}`}
                        alt={`${record.name}'s attendance`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {attendanceRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    Belum ada riwayat absensi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {attendanceRecords.length > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#48A6A7] hover:bg-[#3d9395] text-white'
              }`}
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === number
                    ? 'bg-[#48A6A7] text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#48A6A7] hover:bg-[#3d9395] text-white'
              }`}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

