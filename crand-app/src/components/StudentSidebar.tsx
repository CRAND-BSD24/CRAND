import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

const StudentSidebar = () => {
    return (
        <aside className={cn("w-64 h-screen bg-gray-800 text-white p-4")}>
            <nav className="h-full flex flex-col">
                <div className="flex-1">
                    <ul>
                        <li className="mb-4">
                            <a href="/student" className="hover:text-gray-300">
                                Dashboard
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="/student/academic" className="hover:text-gray-300">
                                Akademik
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="/student/attendance" className="hover:text-gray-300">
                                Absensi
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="/student/memorization" className="hover:text-gray-300">
                                Hafalan
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="/student/profile" className="hover:text-gray-300">
                                Profil
                            </a>
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
