import StudentSidebar from "@/components/StudentSidebar";


const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0]">{children}</main>
    </div>
  );
};

export default StudentLayout;
