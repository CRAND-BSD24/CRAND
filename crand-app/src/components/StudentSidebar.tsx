import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuGraduationCap, LuCalendarCheck2, LuBook, LuUser, LuChevronRight } from "react-icons/lu";

const StudentSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { href: "/student", label: "Dashboard", icon: LuLayoutDashboard },
        { href: "/student/academic", label: "Akademik", icon: LuGraduationCap },
        { href: "/student/attendance", label: "Absensi", icon: LuCalendarCheck2 },
        { href: "/student/memorization", label: "Hafalan", icon: LuBook },
        { href: "/student/profile", label: "Profil", icon: LuUser },
    ];

    return (
        <aside className={cn(
            "w-64 min-h-screen bg-gradient-to-b from-gray-800 to-gray-900",
            "text-gray-100 p-5 shadow-xl"
        )}>
            <nav className="h-full flex flex-col">
                <div className="flex-1">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">CRAND</h2>
                        <p className="text-gray-400 text-sm">Student Portal</p>
                    </div>
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg",
                                            "transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-blue-600 text-white font-medium"
                                                : "text-gray-300 hover:bg-gray-700/50"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-transform duration-200",
                                            "group-hover:scale-110"
                                        )} />
                                        <span>{item.label}</span>
                                        <LuChevronRight className={cn(
                                            "w-4 h-4 ml-auto opacity-0 -translate-x-2",
                                            "transition-all duration-200",
                                            "group-hover:opacity-100 group-hover:translate-x-0",
                                            isActive && "opacity-100 translate-x-0"
                                        )} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-700">
                    <LogoutButton className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg py-2.5 transition-colors duration-200" />
                </div>
            </nav>
        </aside>
    );
}

export default StudentSidebar;
