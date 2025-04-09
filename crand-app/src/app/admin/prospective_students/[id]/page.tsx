import { getStudentById } from "./action";
import { notFound } from "next/navigation";
import DeleteButton from "./DeleteButton";
import EditStudentModal from "./EditStudentModal";
import { ObjectId } from "mongodb";
import Image from "next/image";
import Link from "next/link";

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
    "/images/default-avatar.png"; 

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-10">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/admin/prospective_students"
            className="inline-flex items-center text-emerald-800 hover:text-emerald-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke daftar calon santri
          </Link>
          <div className="flex gap-3">
            <EditStudentModal student={student} />
            <DeleteButton id={id} />
          </div>
        </div>
        
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-emerald-800 mb-8">
          Detail Calon Santri
        </h1>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-8 shadow-md">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Image
                src={profilePicture}
                alt={student.name}
                width={160}
                height={160}
                className="rounded-full border-4 border-emerald-800 shadow-lg object-cover"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-emerald-800">{student.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>ID: {student._id.substring(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                  <span>{student.program || "Belum ada program"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200" id="tabs">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <button
                className="inline-flex p-4 rounded-t-lg text-emerald-800 border-b-2 border-emerald-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Data Calon Santri
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              label="Jenis Kelamin"
              value={student.gender}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              }
              label="Tempat, Tanggal Lahir"
              value={student.birth_place_date}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              }
              label="No. HP"
              value={student.phone_number}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              }
              label="Alamat"
              value={student.address}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              }
              label="Tahun Akademik"
              value={student.academic_year}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              }
              label="Tingkat Akademik"
              value={student.academic_level}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              label="Nama Ayah"
              value={student.father_name}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              label="Nama Ibu"
              value={student.mother_name}
            />
            <InfoCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              }
              label="Dibuat"
              value={new Date(student.created_at).toLocaleString("id-ID")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="bg-emerald-50 p-2 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-base text-gray-800 font-semibold mt-1">{value || "-"}</p>
        </div>
      </div>
    </div>
  );
}
