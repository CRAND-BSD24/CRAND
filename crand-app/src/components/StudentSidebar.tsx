'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const StudentSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 h-screen bg-[#006A71] text-white p-6 shadow-lg")}>
      <nav>
        <ul>
          <li className="mb-4">
            <Link
              href="/student"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/student"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71] text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/student/academic"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/student/academic"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71] text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Academic
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/student/attendance"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/student/attendance"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71] text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Attendance
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/student/memorization"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/student/memorization"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71] text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Memorization
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/student/profile"
              className={cn(
                "block px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                pathname === "/student/profile"
                  ? "bg-[#48A6A7] text-white shadow"
                  : "bg-[#006A71] text-[#a2f7fd] hover:bg-[#9ACBD0] hover:text-white"
              )}
            >
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default StudentSidebar;
