import AdminSidebar from "@/components/AdminSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
};

export default AdminLayout;
