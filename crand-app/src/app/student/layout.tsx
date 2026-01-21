import StudentSidebar from "@/components/StudentSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex">
        <StudentSidebar />
        <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] min-h-screen pl-0 lg:pl-64">
          <div className="container mx-auto p-6 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default StudentLayout;