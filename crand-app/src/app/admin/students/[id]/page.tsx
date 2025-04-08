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
  
  // Validate ObjectId format
  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const data = await getStudentById(id);
  if (!data) notFound();

  const student = JSON.parse(data);

  return (
    <div className="min-h-screen bg-[#9ACBD0] p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#006A71]">Detail Santri</h1>
          <div className="flex space-x-2">
            <EditStudentModal student={student} />
            <DeleteButton id={id} />
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="flex justify-center md:justify-start">
            <Image
              src={student.profile_picture}
              alt={student.name}
              width={176}
              height={176}
              className="rounded-full border-4 border-[#48A6A7] shadow-lg"
            />
          </div>

          {/* Detail */}
          <div className="space-y-2 text-gray-800 text-base">
            <Detail label="Nama" value={student.name} />
            <Detail label="Kelas" value={student.class} />
            <Detail label="Tingkat Akademik" value={student.academic_level} />
            <Detail label="Jenis Kelamin" value={student.gender} />
            <Detail label="Nama Ayah" value={student.father_name} />
            <Detail label="Nama Ibu" value={student.mother_name} />
            <Detail label="Tahun Angkatan" value={student.academic_year} />
            <Detail label="Tempat Tanggal Lahir" value={student.birth_date_place} />
            <Detail label="Alamat" value={student.address} />
            <Detail label="Email" value={student.email} />
            <Detail label="Nomor HP" value={student.phone_number} />
            <Detail label="Status Kelulusan" value={student.graduation_status} />
            <Detail label="Status Pembayaran" value={student.payment_status} />
            <Detail label="VA SPP" value={student.VA_SPP} />
            <Detail label="Ekskul" value={student.ekskul} />
            <Detail label="Level" value={student.level} />
            <Detail label="NIS" value={student.nisn} />
            <Detail label="Program" value={student.program} />
            <Detail label="Halaqah" value={student.halaqah} />
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
    <span className="text-gray-700">{value || "-"}</span>
  </div>
);
