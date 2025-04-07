import StudentSidebar from "@/components/StudentSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex">
        <StudentSidebar />
        <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] min-h-screen">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default StudentLayout; 