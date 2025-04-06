import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  return (
    <aside className={cn("w-64 h-screen bg-gray-800 text-white p-4")}>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="/admin" className="hover:text-gray-300">
              Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a href="/admin/users" className="hover:text-gray-300">
              Users
            </a>
          </li>
          <li className="mb-4">
            <a href="/admin/settings" className="hover:text-gray-300">
              Settings
            </a>
          </li>
          <li className="mb-4">
            <a href="/admin/academic" className="hover:text-gray-300">
              Academic
            </a>
          </li>
          <li className="mb-4">
            <a href="/admin/attendance" className="hover:text-gray-300">
              Attendance
            </a>
          </li>
          <li className="mb-4">
            <a href="/admin/memorization" className="hover:text-gray-300">
              Memorization
            </a>
          </li>
          <li className="mb-4">
            <a href="/admin/profile" className="hover:text-gray-300">
              Profile
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
