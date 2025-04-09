import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";
import Link from "next/link";

const StudentSidebar = () => {
    return (
        <aside className={cn("w-64 h-screen bg-gray-800 text-white p-4")}>
            <nav className="h-full flex flex-col">
                <div className="flex-1">
                    <ul>
                        <li className="mb-4">
                            <Link href="/student" className="hover:text-gray-300">
                                Dashboard
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/student/academic" className="hover:text-gray-300">
                                Akademik
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/student/attendance" className="hover:text-gray-300">
                                Absensi
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/student/memorization" className="hover:text-gray-300">
                                Hafalan
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/student/profile" className="hover:text-gray-300">
                                Profil
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link href="/student/pis-assistant" className="hover:text-gray-300">
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
    )
}

export default StudentSidebar;
