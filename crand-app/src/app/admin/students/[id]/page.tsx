import { getStudentById } from "./action";
import { notFound } from "next/navigation";

interface SantriDetailPageProps {
  params: {
    id: string;
  };
}

export default async function SantriDetailPage({ params }: SantriDetailPageProps) {
  const data = await getStudentById(params.id);

  if (!data) {
    notFound();
  }

  const student = JSON.parse(data);

  // Pisahkan tempat & tanggal lahir
  const [birthPlace, birthDate] = student.birth_place_date?.split(", ") ?? ["-", "-"];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detail Santri</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <img src={student.profile_picture} alt={student.name} className="w-32 h-32 object-cover rounded-full border" />
        </div>
        <div><strong>ID:</strong> {student.id}</div>
        <div><strong>Nama:</strong> {student.name}</div>
        <div><strong>Email:</strong> {student.email}</div>
        <div><strong>Nomor HP:</strong> {student.phone_number}</div>
        <div><strong>Program:</strong> {student.program}</div>
        <div><strong>Jenis Kelamin:</strong> {student.gender}</div>
        <div><strong>Alamat:</strong> {student.address}</div>
        <div><strong>Level:</strong> {student.level}</div>
        <div><strong>Tahun Ajaran:</strong> {student.academic_year}</div>
        <div><strong>Tempat Lahir:</strong> {birthPlace}</div>
        <div><strong>Tanggal Lahir:</strong> {birthDate}</div>
        <div><strong>Status Kelulusan:</strong> {student.graduation_status}</div>
        <div><strong>Status Pembayaran:</strong> {student.payment_status}</div>
        <div><strong>Dibuat:</strong> {new Date(student.created_at).toLocaleString()}</div>
        <div><strong>Diperbarui:</strong> {new Date(student.updated_at).toLocaleString()}</div>
      </div>
    </div>
  );
}
