import TeacherSidebar from "@/components/TeacherSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="flex">
        <TeacherSidebar />
        <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] min-h-screen">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default TeacherLayout;
