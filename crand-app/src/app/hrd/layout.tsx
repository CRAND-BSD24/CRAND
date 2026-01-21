import HrdSidebar from "@/components/HrdSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const HrdLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="hrd">
      <div className="flex min-h-screen">
        <HrdSidebar />
        <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] min-h-screen pl-0 lg:pl-64">
          <div className="container mx-auto p-6 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default HrdLayout;