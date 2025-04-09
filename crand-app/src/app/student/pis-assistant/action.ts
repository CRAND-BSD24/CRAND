'use server';
import { getMongoClientInstance } from "@/db/config/connection";
import { AcademicRecord } from '@/types/database'; // Only importing what's used
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// --- IMPORTANT: Import necessary items for session handling ---
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
// --------------------------------------------------------------

const MODEL_NAME = "gemini-1.5-flash"; 
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Helper function (can be shared or duplicated)
function getGenderDisplay(gender: string | undefined): string {
  if (!gender) return 'Tidak Diketahui';
  switch(gender.toLowerCase()) {
    case 'l': case 'laki-laki': case 'male': return 'Laki-laki';
    case 'p': case 'perempuan': case 'female': return 'Perempuan';
    default: return 'Tidak Diketahui';
  }
}

// Fetches context specifically for the logged-in student
async function getDatabaseContextForStudent(db: any, userId: string | ObjectId, normalizedQuestion: string, question: string): Promise<string | null> {
    try {
        const studentId = new ObjectId(userId); // Assuming student uses the user ID directly or has a link
        // Alternatively, find student based on email/other unique identifier from session

        // --- Query 1: Get Logged-in Student's Basic Info --- 
        const student = await db.collection('students').findOne({ _id: studentId }); // Or based on user relationship
        
        if (!student) {
            console.error(`[Student Context] Student not found for userId: ${userId}`);
            return "Maaf, data santri Anda tidak ditemukan.";
        }

        let context = `Konteks Pribadi Santri ${student.name}:\n`;
        context += `Nama: ${student.name}\nKelas: ${student.class}\nStatus: ${student.status}\nJenis Kelamin: ${getGenderDisplay(student.gender)}\n`;
        if (student.enrollmentDate) context += `Tanggal Masuk: ${new Date(student.enrollmentDate).toLocaleDateString('id-ID')}\n`;

        // --- Query 2: Get Student's Recent Achievements --- 
        if (normalizedQuestion.includes('prestasi') || normalizedQuestion.includes('achievement')) {
            console.log(`[Student Context] Fetching achievements for student: ${studentId}`);
            const achievements: any[] = await db.collection('achievements').find({ studentId: studentId }).sort({ date: -1 }).limit(5).toArray();
            if (achievements.length > 0) {
                context += '\nPrestasi Terbaru Anda:\n';
                achievements.forEach((ach: any, i: number) => context += `${i + 1}. ${ach.title} (${ach.category}, ${ach.level}, ${ach.date ? new Date(ach.date).toLocaleDateString('id-ID') : 'N/A'})\n`);
            } else {
                context += '\nAnda belum memiliki catatan prestasi.\n';
            }
        }

        // --- Query 3: Get Student's Recent Academic Records --- 
        if (normalizedQuestion.includes('akademik') || normalizedQuestion.includes('nilai') || normalizedQuestion.includes('rapor')) {
            console.log(`[Student Context] Fetching academic records for student: ${studentId}`);
            const academicRecords: AcademicRecord[] = await db.collection('academic_records').find({ studentId: studentId }).sort({ year: -1, semester: -1 }).limit(2).toArray();
             if (academicRecords.length > 0) {
                context += '\nAkademik Terbaru Anda:\n';
                academicRecords.forEach((rec: AcademicRecord) => {
                    context += `(${rec.semester} ${rec.year}): Rata-rata ${rec.average?.toFixed(2) || 'N/A'}, Peringkat ${rec.rank || 'N/A'}\n`;
                });
            } else {
                 context += '\nBelum ada catatan akademik untuk Anda.\n';
            }
        }
        
        // --- Query 4: Get Student's Recent Attendance --- 
        if (normalizedQuestion.includes('hadir') || normalizedQuestion.includes('absensi') || normalizedQuestion.includes('kehadiran')) {
             console.log(`[Student Context] Fetching attendance for student: ${studentId}`);
             const sevenDaysAgo = new Date();
             sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
             const attendance: any[] = await db.collection('attendance').find({ studentId: studentId, date: { $gte: sevenDaysAgo } }).sort({date: -1}).toArray();
             if (attendance.length > 0) {
                 context += '\nKehadiran Anda (7 hari terakhir):\n';
                 attendance.forEach((att: any) => {
                     const dateStr = att.date ? new Date(att.date).toLocaleDateString('id-ID') : 'Tanggal tidak valid';
                     context += `${dateStr}: ${att.status}\n`;
                 });
             } else {
                 context += '\nTidak ada catatan kehadiran (7 hari terakhir).\n';
             }
        }
        
        // Add more specific context queries based on keywords if needed

        return context;

    } catch (error) {
        console.error("[Student Context] Error fetching context:", error);
        return "Terjadi kesalahan saat mengambil data konteks Anda."; // Return error context
    }
}

export async function processStudentQuestion(question: string): Promise<string> {
  // --- Get Session & Verify Role --- 
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'student') { 
     return "❌ Error: Akses ditolak. Anda harus login sebagai santri.";
  }
  const userId = (session.user as any).id; // Adjust based on your session user structure
  console.log(`[Student Action] Processing question for student ID: ${userId}`);
  // -----------------------------------

  if (!API_KEY) {
    return "❌ Error: GOOGLE_GEMINI_API_KEY tidak ditemukan.";
  }

  try {
    const client = await getMongoClientInstance();
    const db: any = client.db("pesantren_db");
    const normalizedQuestion = question.toLowerCase();

    // 1. Get context (specific to the logged-in student)
    const dbContext = await getDatabaseContextForStudent(db, userId, normalizedQuestion, question);

    // 2. Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 1024 }; // Slightly different config?
    const safetySettings = [ /* ... same as admin ... */ 
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // 3. Construct the prompt for Gemini (Student specific)
    const systemPrompt = `Anda adalah PIS Assistant untuk Santri. 
Tugas Anda adalah menjawab pertanyaan santri HANYA tentang data MEREKA SENDIRI (nilai, absensi, prestasi) atau informasi umum pesantren yang relevan.
Gunakan konteks yang diberikan. JANGAN memberikan informasi tentang santri lain atau ustadz.
Jika pertanyaan di luar lingkup, katakan Anda tidak bisa menjawabnya.
Selalu jawab dalam Bahasa Indonesia yang ramah dan sopan. Sapa santri dengan baik.`;

    let userPrompt = `Pertanyaan Santri: "${question}"`;
    if (dbContext) {
       userPrompt += `\n\nKonteks Pribadi Anda:\n${dbContext}`;
       console.log("[Student Action] Sending context to Gemini:\n", dbContext);
    } else {
        console.log("[Student Action] No specific database context found for Gemini.");
    }

    // 4. Call Gemini API
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Assalamu'alaikum! Ada yang bisa saya bantu terkait informasi Anda di pesantren?" }] },
      ],
    });

    console.log("[Student Action] Sending prompt to Gemini:", userPrompt);
    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    const assistantResponse = response.text();

    console.log("[Student Action] Gemini Raw Response:", JSON.stringify(response, null, 2));
    console.log("[Student Action] Gemini Text Response:", assistantResponse);

    return assistantResponse || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

  } catch (error: unknown) {
    console.error('[Student Action] Error processing question:', error);
    let errorMessage = 'Error tidak diketahui';
    if (error instanceof Error) { errorMessage = error.message; }
    // Basic error, avoid leaking details
    return `❌ Maaf, terjadi kesalahan internal saat memproses pertanyaan Anda.`; 
  }
} 