import AdminSidebar from "@/components/AdminSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0]">{children}</main>
    </div>
  );
};

export default AdminLayout;
