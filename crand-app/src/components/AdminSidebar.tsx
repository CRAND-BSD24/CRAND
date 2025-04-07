'use client';

import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";
import logo from "@/assets/logo.jpg";
import Image from "next/image";

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
              <a href="/admin" className="hover:text-gray-300">
                Dashboard
              </a>
            </li>
            <li className="mb-4">
              <a href="/admin/students" className="hover:text-gray-300">
                Santri
              </a>
            </li>
            <li className="mb-4">
              <a href="/admin/academic" className="hover:text-gray-300">
                Akademik
              </a>
            </li>
            <li className="mb-4">
              <a href="/admin/attendance" className="hover:text-gray-300">
                Absensi
              </a>
            </li>
            <li className="mb-4">
              <a href="/admin/memorization" className="hover:text-gray-300">
                Hafalan
              </a>
            </li>
            <li className="mb-4">
              <a href="/admin/profile" className="hover:text-gray-300">
                Profil
              </a>
            </li>
            <li className="mb-4">
              <a href="/admin/pis-assistant" className="hover:text-gray-300">
                PIS Assistant
              </a>
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
