import AdminSidebar from "@/components/AdminSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0]">{children}</main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
