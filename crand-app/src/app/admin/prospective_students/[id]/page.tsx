import { getStudentById } from "./action";
import { notFound } from "next/navigation";
import DeleteButton from "./DeleteButton";
import EditStudentModal from "./EditStudentModal";
import { ObjectId } from "mongodb";
import Image from "next/image";

interface SantriDetailPageProps {
  params: {
    id: string;
  };
}

export default async function SantriDetailPage({ params }: SantriDetailPageProps) {
  const awaitedParams = await params;
  const id = awaitedParams.id;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const data = await getStudentById(id);
  if (!data) notFound();

  const student = JSON.parse(data);

  const profilePicture =
    student.profile_picture ||
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA..."; // Diperpendek

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CDEEEF] to-[#F5FBFC] p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8 md:p-12 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-4xl font-bold text-[#006A71]">Detail Calon Santri</h1>
          <div className="flex gap-3">
            <EditStudentModal student={student} />
            <DeleteButton id={id} />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Foto Profil */}
          <div className="flex justify-center md:justify-start">
            <Image
              src={profilePicture}
              alt={student.name}
              width={180}
              height={180}
              className="rounded-full border-4 border-[#48A6A7] shadow-md object-cover w-[180px] h-[180px]"
            />
          </div>

          {/* Detail */}
          <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed">
            <Detail label="ID" value={student._id} />
            <Detail label="Nama" value={student.name} />
            <Detail label="Email" value={student.email} />
            <Detail label="Nomor HP" value={student.phone_number} />
            <Detail label="Program" value={student.program} />
            <Detail label="Jenis Kelamin" value={student.gender} />
            <Detail label="Alamat" value={student.address} />
            <Detail label="Tingkat Akademik" value={student.academic_level} />
            <Detail label="Tahun Ajaran" value={student.academic_year} />
            <Detail label="Tempat & Tanggal Lahir" value={student.birth_place_date} />
            <Detail label="Nama Bapak" value={student.father_name} />
            <Detail label="Nama Ibu" value={student.mother_name} />
            <Detail label="Dibuat" value={new Date(student.created_at).toLocaleString("id-ID")} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Detail lebih rapi
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-2">
    <span className="font-semibold text-[#006A71] w-48">{label}:</span>
    <span className="text-gray-800">{value || "-"}</span>
  </div>
);
