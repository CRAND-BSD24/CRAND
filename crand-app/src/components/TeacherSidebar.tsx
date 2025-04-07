import { cn } from "@/lib/utils";

const TeacherSidebar = () => {
  return (
    <aside className={cn("w-64 h-screen bg-gray-800 text-white p-4")}>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="/teacher" className="hover:text-gray-300">
              Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a href="/teacher/students" className="hover:text-gray-300">
              Santri
            </a>
          </li>
          <li className="mb-4">
            <a href="/teacher/academic" className="hover:text-gray-300">
              Akademik
            </a>
          </li>
          <li className="mb-4">
            <a href="/teacher/attendance" className="hover:text-gray-300">
              Absensi
            </a>
          </li>
          <li className="mb-4">
            <a href="/teacher/memorization" className="hover:text-gray-300">
              Hafalan
            </a>
          </li>
          <li className="mb-4">
            <a href="/teacher/profile" className="hover:text-gray-300">
              Profil
            </a>
          </li>
          <li className="mb-4">
            <a href="/teacher/pis-assistant" className="hover:text-gray-300">
              PIS Assistant
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default TeacherSidebar;
