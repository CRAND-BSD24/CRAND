"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const ProfilePage = () => {
  const teacherData = {
    name: "Ustadz Ahmad",
    email: "ahmad@pesantren.com",
    phone: "081234567890",
    address: "Jl. Pesantren No. 123, Kota Bandung",
    subjects: ["Matematika", "Al-Quran"],
    classes: ["10A", "10B"],
  };

  return (
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Profil Ustadz</h1>
          <p className="text-gray-600">Kelola informasi profil Anda</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <User className="mr-2 h-4 w-4" />
          Edit Profil
        </Button>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nama Lengkap</p>
              <p className="font-medium">{teacherData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{teacherData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nomor Telepon</p>
              <p className="font-medium">{teacherData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alamat</p>
              <p className="font-medium">{teacherData.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Informasi Mengajar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mata Pelajaran</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherData.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kelas yang Diampu</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherData.classes.map((class_, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {class_}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
