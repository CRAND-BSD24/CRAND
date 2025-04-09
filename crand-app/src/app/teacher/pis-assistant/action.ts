'use server';

import { getMongoClientInstance } from "@/db/config/connection";
// Assuming Student is correct. Removed Teacher, User.
import { Student } from '@/types/database'; 
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// --- IMPORTANT: Import necessary items for session handling ---
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
// --------------------------------------------------------------

const MODEL_NAME = "gemini-1.5-flash"; 
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Fetches context specifically for the logged-in teacher and related students
// Keep db: any for now
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDatabaseContextForTeacher(db: any, userId: string | ObjectId, normalizedQuestion: string, question: string): Promise<string | null> {
    try {
        const teacherId = new ObjectId(userId); 

        // --- Query 1: Get Logged-in Teacher's Basic Info --- 
        // Using any for teacher type as Teacher/User not found
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const teacher: any = await db.collection('teachers').findOne({ _id: teacherId }) || await db.collection('users').findOne({ _id: teacherId, role: 'teacher' }); 
        
        if (!teacher) {
            console.error(`[Teacher Context] Teacher not found for userId: ${userId}`);
            return "Maaf, data Anda sebagai pengajar tidak ditemukan.";
        }

        let context = `Konteks Pribadi Pengajar ${teacher.name}:\n`;
        // Add teacher-specific fields if they exist
        if (teacher.position) context += `Jabatan: ${teacher.position}\n`;
        if (teacher.status) context += `Status: ${teacher.status}\n`;
        if (teacher.joinDate) context += `Tanggal Bergabung: ${new Date(teacher.joinDate).toLocaleDateString('id-ID')}\n`;
        if (teacher.specialization) context += `Spesialisasi: ${teacher.specialization}\n`;
        context += "---\n";

        // --- Query 2: Get Students Related to the Teacher --- 
        // Assuming Student type is correct
        let relatedStudents: Student[] = [];
        if (teacher.classes && Array.isArray(teacher.classes) && teacher.classes.length > 0) {
             console.log(`[Teacher Context] Fetching students for classes: ${teacher.classes.join(', ')}`);
            // Removed <Student> type argument
            relatedStudents = await db.collection('students').find({ class: { $in: teacher.classes } }).limit(50).toArray(); // Limit results
        }
        
        if (relatedStudents.length > 0) {
            context += `Santri yang Berhubungan Dengan Anda (Kelas: ${teacher.classes?.join(', ') || 'N/A'}):\n`;
            
            let specificStudentMentioned = false;
            let targetStudentName = "";
            if (normalizedQuestion.includes('santri bernama') || normalizedQuestion.includes('info santri')) {
                 targetStudentName = question.split(/santri bernama|info santri/i)[1]?.trim() || "";
            }

            relatedStudents.forEach((student: Student, i: number) => {
                const studentNameLower = student.name.toLowerCase();
                if (targetStudentName && studentNameLower.includes(targetStudentName.toLowerCase())) {
                    if (!specificStudentMentioned) {
                         context += `Informasi Santri Spesifik (${student.name}):\n`;
                         specificStudentMentioned = true; 
                    }
                    context += `  - Nama: ${student.name}, Kelas: ${student.class}, Status: ${student.status}\n`;
                } else if (!targetStudentName) {
                     if (i < 10) { 
                        context += `  - ${student.name} (Kelas: ${student.class})\n`;
                     }
                     if (i === 10) context += `  - ... (dan lainnya)\n`;
                }
            });
            
            if(targetStudentName && !specificStudentMentioned){
                 context += `  - Tidak ditemukan santri bernama "${targetStudentName}" di kelas yang Anda ajar.\n`;
            }

        } else {
            context += 'Tidak ada data santri yang terkait langsung dengan Anda saat ini.\n';
        }
        
        return context;

    } catch (error) {
        console.error("[Teacher Context] Error fetching context:", error);
        return "Terjadi kesalahan saat mengambil data konteks Anda.";
    }
}

export async function processTeacherQuestion(question: string): Promise<string> {
  // --- Get Session & Verify Role --- 
  const session = await getServerSession(authOptions);
  // Using any temporarily for session user structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || !session.user || (session.user as any).role !== 'teacher') { 
     return "❌ Error: Akses ditolak. Anda harus login sebagai pengajar.";
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any).id; // Using any temporarily
  console.log(`[Teacher Action] Processing question for teacher ID: ${userId}`);
  // -----------------------------------

  if (!API_KEY) {
    return "❌ Error: GOOGLE_GEMINI_API_KEY tidak ditemukan.";
  }

  try {
    const client = await getMongoClientInstance();
    // Keep db: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = client.db("pesantren_db");
    const normalizedQuestion = question.toLowerCase();

    // 1. Get context (specific to the logged-in teacher & related students)
    const dbContext = await getDatabaseContextForTeacher(db, userId, normalizedQuestion, question);

    // 2. Initialize Gemini AI (same as others)
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const generationConfig = { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 1024 }; 
    const safetySettings = [ /* ... same as admin ... */ 
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // 3. Construct the prompt for Gemini (Teacher specific)
    const systemPrompt = `Anda adalah PIS Assistant untuk Pengajar (Ustadz/Ustadzah). 
Tugas Anda adalah menjawab pertanyaan pengajar tentang data PRIBADI mereka atau data santri yang BERHUBUNGAN LANGSUNG dengan mereka (misal: di kelas yang sama).
Gunakan konteks yang diberikan. JANGAN memberikan informasi tentang santri/ustadz lain yang tidak berhubungan.
Jika pertanyaan di luar lingkup, katakan Anda tidak bisa menjawabnya.
Selalu jawab dalam Bahasa Indonesia yang formal dan sopan.`;

    let userPrompt = `Pertanyaan Pengajar: "${question}"`;
    if (dbContext) {
       userPrompt += `\n\nKonteks Relevan Anda:\n${dbContext}`;
       console.log("[Teacher Action] Sending context to Gemini:\n", dbContext);
    } else {
        console.log("[Teacher Action] No specific database context found for Gemini.");
    }

    // 4. Call Gemini API
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Assalamu'alaikum Ustadz/Ustadzah. Ada yang bisa saya bantu terkait data Anda atau santri yang Anda ajar?" }] },
      ],
    });

    console.log("[Teacher Action] Sending prompt to Gemini:", userPrompt);
    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    const assistantResponse = response.text();

    console.log("[Teacher Action] Gemini Raw Response:", JSON.stringify(response, null, 2));
    console.log("[Teacher Action] Gemini Text Response:", assistantResponse);

    return assistantResponse || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

  } catch (error: unknown) {
    console.error('[Teacher Action] Error processing question:', error);
    let errorMessage = 'Error tidak diketahui';
    if (error instanceof Error) { errorMessage = error.message; }
    // Use the errorMessage in the return string
    return `❌ Maaf, terjadi kesalahan internal saat memproses pertanyaan Anda: ${errorMessage}`;
  }
} 