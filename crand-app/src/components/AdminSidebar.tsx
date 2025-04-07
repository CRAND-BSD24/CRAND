'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 h-screen bg-[#006A71] text-white p-6 shadow-lg fixed")}>
      <nav>
        <ul>
          <li className="mb-4">
            <Link
              href="/admin"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/admin"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71]  text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/admin/students"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/admin/students"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71]  text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Santri
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/admin/academic"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/admin/academic"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71]  text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Akademik
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/admin/attendance"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/admin/attendance"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71]  text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Absensi
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/admin/memorization"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/admin/memorization"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71]  text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Hafalan
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/admin/profile"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/admin/profile"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71]  text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Profil
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/admin/pis-assistant"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/admin/pis-assistant"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71]  text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              PIS Assistant
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
