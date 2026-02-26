"use client";

import React from "react";
import Link from "next/link";
import { Users, UserPlus, FileText } from "lucide-react";

export default function AdminHrdDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin HRD</h1>
      <p className="text-gray-600">Selamat datang di panel Admin HRD.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/hrd/teachers" className="block">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-100 cursor-pointer h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Data SDM</h3>
            </div>
            <p className="text-gray-600">Kelola data seluruh SDM, guru, dan staf.</p>
          </div>
        </Link>

        <Link href="/hrd/teachers/create" className="block">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-100 cursor-pointer h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <UserPlus size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Tambah SDM Baru</h3>
            </div>
            <p className="text-gray-600">Input data SDM baru ke dalam sistem.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
