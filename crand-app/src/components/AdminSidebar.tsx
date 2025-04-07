'use client';

import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";
import logo from "@/assets/logo.jpg";
import Image from "next/image";
import Link from "next/link";

const AdminSidebar = () => {

  return (
    <aside className={cn("w-64 h-screen bg-gray-800 text-white p-4")}>
      <nav className="h-full flex flex-col">
        <div className="flex items-center justify-center mb-8">
          <Image src={logo} alt="logo" className="w-15 h-15 rounded-full" />
          <h1 className="text-2xl font-bold px-7">CRAND</h1>
        </div>
        <div className="flex-1">
          <ul>
            <li className="mb-4">
              <Link href="/admin" className="hover:text-gray-300">
                Dashboard
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/students" className="hover:text-gray-300">
                Santri
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/prospective_students" className="hover:text-gray-300">
                Calon Santri
              </Link>
            </li>
            {/* <li className="mb-4">
              <Link href="/admin/academic" className="hover:text-gray-300">
                Akademik
              </Link>
            </li> */}
            <li className="mb-4">
              <Link href="/admin/attendance" className="hover:text-gray-300">
                Absensi
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/teachers" className="hover:text-gray-300">
                Ustad
              </Link>
            </li>
            {/* <li className="mb-4">
              <Link href="/admin/memorization" className="hover:text-gray-300">
                Hafalan
              </Link>
            </li> */}
            <li className="mb-4">
              <Link href="/admin/profile" className="hover:text-gray-300">
                Profil
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/pis-assistant" className="hover:text-gray-300">
                PIS Assistant
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-auto">
          <LogoutButton className="w-full" />
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
