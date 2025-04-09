'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { AcademicRecord } from '@/types/database';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash"; 
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Helper function to get gender display text
function getGenderDisplay(gender: string | undefined): string {
  if (!gender) return 'Tidak Diketahui';
  
  // Handle various possible gender values from database
  switch(gender.toLowerCase()) {
    case 'l':
    case 'laki-laki':
    case 'male':
      return 'Laki-laki';
    case 'p':
    case 'perempuan':
    case 'female':
      return 'Perempuan';
    default:
      return 'Tidak Diketahui';
  }
}

// Using any for db type until Db is exported from connection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDatabaseContextForAdmin(db: any, normalizedQuestion: string, question: string): Promise<string | null> {
    // This function contains the previous database querying logic
    // It returns a formatted string with the context or null if no specific query matches

    // Handle questions about specific student
    if (normalizedQuestion.includes('santri bernama') || normalizedQuestion.includes('info santri')) {
      let studentName;
      if (normalizedQuestion.includes('santri bernama')) {
        studentName = question.split('santri bernama')[1].trim();
      } else if (normalizedQuestion.includes('info santri')) {
        studentName = question.split('info santri')[1].trim();
      }

      if (studentName) {
          console.log("[Admin Context] Fetching context for student:", studentName);
          const student = await db.collection('students').findOne({ name: { $regex: `.*${studentName}.*`, $options: 'i' } });
          if (!student) return `Tidak ada data santri dengan nama "${studentName}".`;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const achievements: any[] = await db.collection('achievements').find({ studentId: new ObjectId(student._id) }).sort({ date: -1 }).limit(3).toArray();
          const academicRecords: AcademicRecord[] = await db.collection('academic_records').find({ studentId: new ObjectId(student._id) }).sort({ year: -1, semester: -1 }).limit(1).toArray();
          const currentMonth = new Date(); currentMonth.setDate(1);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const attendance: any[] = await db.collection('attendance').find({ studentId: new ObjectId(student._id), date: { $gte: currentMonth } }).toArray();
          
          let context = `Konteks Data Santri ${student.name}:\n`;
          context += `Kelas: ${student.class}, Status: ${student.status}, Jenis Kelamin: ${getGenderDisplay(student.gender)}\n`;
          if (student.enrollmentDate) context += `Tanggal Masuk: ${new Date(student.enrollmentDate).toLocaleDateString('id-ID')}\n`;
        if (achievements.length > 0) {
            context += 'Prestasi:\n';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            achievements.forEach((ach: any, i: number) => context += `${i + 1}. ${ach.title} (${ach.category}, ${ach.level}, ${ach.date ? new Date(ach.date).toLocaleDateString('id-ID') : 'N/A'})\n`);
          }
        if (academicRecords.length > 0) {
            const rec: AcademicRecord = academicRecords[0];
            context += `Akademik (${rec.semester} ${rec.year}): Rata-rata ${rec.average?.toFixed(2) || 'N/A'}, Peringkat ${rec.rank || 'N/A'}\n`;
          }
        if (attendance.length > 0) {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const present = attendance.filter((a: any) => a.status === 'present').length;
          const total = attendance.length;
             const percentage = total > 0 ? (present / total * 100).toFixed(1) : '0';
             context += `Kehadiran bulan ini: ${percentage}% (${present}/${total})\n`;
           }
          return context;
      }
    }

    // Handle questions about specific teacher
    if (normalizedQuestion.includes('ustadz bernama') || normalizedQuestion.includes('info ustadz')) {
      let teacherName;
      if (normalizedQuestion.includes('ustadz bernama')) {
        teacherName = question.split('ustadz bernama')[1].trim();
      } else if (normalizedQuestion.includes('info ustadz')) {
        teacherName = question.split('info ustadz')[1].trim();
      }

      if (teacherName) {
         console.log("[Admin Context] Fetching context for teacher:", teacherName);
         const teacher = await db.collection('teachers').findOne({ name: { $regex: `.*${teacherName}.*`, $options: 'i' } }) || 
                         await db.collection('users').findOne({ name: { $regex: `.*${teacherName}.*`, $options: 'i' }, role: { $in: ["teacher", "ustadz", "ustadzah", "guru"] } });
                         
         if (!teacher) return `Tidak ada data ustadz dengan nama "${teacherName}".`;

         let context = `Konteks Data Ustadz ${teacher.name}:\n`;
         if (teacher.position) context += `Jabatan: ${teacher.position}\n`;
         if (teacher.status) context += `Status: ${teacher.status}\n`;
         if (teacher.joinDate) context += `Tanggal Bergabung: ${new Date(teacher.joinDate).toLocaleDateString('id-ID')}\n`;
         if (teacher.phone) context += `Telepon: ${teacher.phone}\n`;
         if (teacher.email) context += `Email: ${teacher.email}\n`;
         if (teacher.specialization) context += `Spesialisasi: ${teacher.specialization}\n`;
         return context;
      }
    }

    // Handle questions about total students
    if (normalizedQuestion.includes('jumlah santri') || normalizedQuestion.includes('total santri')) {
      console.log("[Admin Context] Fetching context for total students");
      const totalStudents = await db.collection('students').countDocuments();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusCounts: any[] = await db.collection('students').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray();
      let context = `Konteks Jumlah Santri: Total ${totalStudents} orang.\n`;
      context += "Detail Status:\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      statusCounts.forEach((s: any) => context += `${s._id}: ${s.count}\n`);
      return context;
    }

    // Handle questions about total teachers
    if (normalizedQuestion.includes('jumlah ustadz') || normalizedQuestion.includes('total ustadz')) {
      console.log("[Admin Context] Fetching context for total teachers");
      const totalTeachers = await db.collection('teachers').countDocuments() + await db.collection('users').countDocuments({ role: { $in: ["teacher", "ustadz", "ustadzah", "guru"] } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusCounts: any[] = await db.collection('teachers').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray();
      let context = `Konteks Jumlah Ustadz: Total ${totalTeachers} orang.\n`;
      context += "Detail Status (dari collection 'teachers'):\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      statusCounts.forEach((s: any) => context += `${s._id || 'Aktif'}: ${s.count}\n`);
      return context;
    }

    // Handle questions about class distribution
    if (normalizedQuestion.includes('kelas') || normalizedQuestion.includes('tingkat')) {
      console.log("[Admin Context] Fetching context for class distribution");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const classDistribution: any[] = await db.collection('students').aggregate([ { $group: { _id: '$class', count: { $sum: 1 } } }, { $sort: { _id: 1 } } ]).toArray();
      if (classDistribution.length === 0) return "Tidak ada data distribusi kelas.";
      let context = "Konteks Distribusi Kelas:\n";
      let totalSantri = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      classDistribution.forEach((cls: any) => { context += `Kelas ${cls._id}: ${cls.count}\n`; totalSantri += cls.count; });
      context += `Total Santri: ${totalSantri}`;
      return context;
    }

    return null; // No specific context found
}

export async function processQuestion(question: string): Promise<string> {
  // --- IMPORTANT: Add session validation here for production --- 
  // Example (needs adjustment based on your auth setup):
  // const session = await getServerSession(authOptions); 
  // if (!session || session.user.role !== 'admin') { 
  //   return "❌ Error: Akses ditolak.";
  // }
  // console.log(`Processing question for admin: ${session.user.email}`);
  // --------------------------------------------------------------

  if (!API_KEY) {
    return "❌ Error: GOOGLE_GEMINI_API_KEY tidak ditemukan di environment variables.";
  }

  try {
    const client = await getMongoClientInstance();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = client.db("pesantren_db");
    const normalizedQuestion = question.toLowerCase();

    // 1. Get context from database (using admin/unrestricted function)
    const dbContext = await getDatabaseContextForAdmin(db, normalizedQuestion, question);

    // 2. Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.8, // Adjust for creativity vs factualness
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

     const safetySettings = [
       { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
     ];

    // 3. Construct the prompt for Gemini (Admin specific potentially)
    const systemPrompt = `Anda adalah PIS Assistant (Admin Access), asisten AI untuk sistem informasi pesantren. 
Tugas Anda adalah menjawab pertanyaan pengguna (Admin) terkait data santri dan ustadz berdasarkan informasi yang ada di database pesantren.
Anda memiliki akses penuh ke data. Gunakan konteks yang diberikan jika relevan.
Selalu jawab dalam Bahasa Indonesia yang baik dan sopan.`;

    let userPrompt = `Pertanyaan Pengguna (Admin): "${question}"`;
    if (dbContext) {
       userPrompt += `\n\nKonteks dari Database (Full Access):\n${dbContext}`;
       console.log("[Admin Action] Sending context to Gemini:\n", dbContext);
    } else {
        console.log("[Admin Action] No specific database context found for Gemini.");
    }

    // 4. Call Gemini API
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Baik, saya PIS Assistant (Admin). Siap membantu Anda." }] },
      ],
    });

    console.log("[Admin Action] Sending prompt to Gemini:", userPrompt);
    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    const assistantResponse = response.text();

    console.log("[Admin Action] Gemini Raw Response:", JSON.stringify(response, null, 2));
    console.log("[Admin Action] Gemini Text Response:", assistantResponse);

    return assistantResponse || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";


  } catch (error: unknown) { // Use unknown instead of any
    console.error('[Admin Action] Error processing question with Gemini:', error);
    let errorMessage = 'Error tidak diketahui';
    if (error instanceof Error) {
      errorMessage = error.message;
       if (errorMessage.includes('API key not valid')) {
         return "❌ Error: Kunci API Google Gemini tidak valid. Silakan periksa konfigurasi.";
       }
    }
    return `❌ Maaf, terjadi kesalahan saat menghubungi AI Assistant: ${errorMessage}`;
  }
} 