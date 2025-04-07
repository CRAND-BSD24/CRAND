import TeacherSidebar from "@/components/TeacherSidebar";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <TeacherSidebar />
      <main className="flex-1 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default TeacherLayout;
