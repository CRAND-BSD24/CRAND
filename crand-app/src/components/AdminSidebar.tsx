import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

const AdminSidebar = () => {
  return (
    <aside className={cn("w-64 h-screen bg-gray-800 text-white p-4")}>
      <nav className="h-full flex flex-col">
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
