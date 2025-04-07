import { getStudentById } from "./action";
import { notFound } from "next/navigation";
import DeleteButton from "./DeleteButton";
import EditStudentModal from "./EditStudentModal";

interface SantriDetailPageProps {
  params: {
    id: string;
  };
}

export default async function SantriDetailPage({ params }: SantriDetailPageProps) {
  const data = await getStudentById(params.id);
  if (!data) notFound();

  const student = JSON.parse(data);
  const [birthPlace, birthDate] = student.birth_place_date?.split(", ") ?? ["-", "-"];

  return (
    <div className="min-h-screen bg-[#9ACBD0] p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#006A71]">Detail Santri</h1>
          <div className="flex space-x-2">
            <EditStudentModal student={student} />
            <DeleteButton id={params.id} />
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src={student.profile_picture}
              alt={student.name}
              className="w-44 h-44 object-cover rounded-full border-4 border-[#48A6A7] shadow-lg"
            />
          </div>

          {/* Detail */}
          <div className="space-y-2 text-gray-800 text-base">
            <Detail label="ID" value={student.id} />
            <Detail label="Nama" value={student.name} />
            <Detail label="Email" value={student.email} />
            <Detail label="Nomor HP" value={student.phone_number} />
            <Detail label="Program" value={student.program} />
            <Detail label="Jenis Kelamin" value={student.gender} />
            <Detail label="Alamat" value={student.address} />
            <Detail label="Level" value={student.level} />
            <Detail label="Tahun Ajaran" value={student.academic_year} />
            <Detail label="Tempat Lahir" value={birthPlace} />
            <Detail label="Tanggal Lahir" value={birthDate} />
            <Detail label="Status Pembayaran" value={student.payment_status} />
            <Detail label="Dibuat" value={new Date(student.created_at).toLocaleString()} />
            <Detail label="Diperbarui" value={new Date(student.updated_at).toLocaleString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="font-medium text-[#006A71]">{label}:</span>{" "}
    <span className="text-gray-700">{value || '-'}</span>
  </div>
);
