"use server";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId, Db, Document, WithId } from "mongodb";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
// --- IMPORTANT: Import necessary items for session handling ---
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
// --------------------------------------------------------------

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

interface AcademicRecord extends WithId<Document> {
  studentId: ObjectId;
  semester: string;
  year: string;
  subjects: {
    name: string;
    grade: number;
  }[];
  gpa: number;
  status: string;
  average?: number;
  rank?: number;
  created_at: Date;
  updated_at: Date;
}

// Helper function (can be shared or duplicated)
function getGenderDisplay(gender: string | undefined): string {
  if (!gender) return "Tidak Diketahui";
  switch (gender.toLowerCase()) {
    case "l":
    case "laki-laki":
    case "male":
      return "Laki-laki";
    case "p":
    case "perempuan":
    case "female":
      return "Perempuan";
    default:
      return "Tidak Diketahui";
  }
}

// Helper function (can be shared or duplicated)
function normalizeQuestion(question: string): string {
  return question.toLowerCase().trim();
}

// Fetches context specifically for the logged-in student
async function getDatabaseContextForStudent(
  db: Db,
  userId: string | ObjectId,
  normalizedQuestion: string
): Promise<string | null> {
  try {
    const studentId = new ObjectId(userId);
    const academicRecords = (await db
      .collection("academic_records")
      .find({ studentId })
      .sort({ created_at: -1 })
      .toArray()) as AcademicRecord[];

    if (!academicRecords || academicRecords.length === 0) {
      return null;
    }

    // Format the academic records into a readable context
    const formattedRecords = academicRecords.map((record) => {
      return `
        Semester: ${record.semester}
        Year: ${record.year}
        GPA: ${record.gpa}
        Status: ${record.status}
        ${record.average ? `Average: ${record.average}` : ""}
        ${record.rank ? `Rank: ${record.rank}` : ""}
        Subjects:
        ${record.subjects
          .map((subject) => `- ${subject.name}: ${subject.grade}`)
          .join("\n")}
      `;
    });

    return formattedRecords.join("\n");
  } catch (error) {
    console.error("Error fetching student context:", error);
    return null;
  }
}

export async function processStudentQuestion(
  question: string
): Promise<string> {
  // --- Get Session & Verify Role ---
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "student") {
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
    const normalizedQuestion = normalizeQuestion(question);

    // 1. Get context (specific to the logged-in student)
    const dbContext = await getDatabaseContextForStudent(
      db,
      userId,
      normalizedQuestion
    );

    // 2. Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 1024,
    }; // Slightly different config?
    const safetySettings = [
      /* ... same as admin ... */
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
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
      console.log(
        "[Student Action] No specific database context found for Gemini."
      );
    }

    // 4. Call Gemini API
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            {
              text: "Assalamu'alaikum! Ada yang bisa saya bantu terkait informasi Anda di pesantren?",
            },
          ],
        },
      ],
    });

    console.log("[Student Action] Sending prompt to Gemini:", userPrompt);
    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    const assistantResponse = response.text();

    console.log(
      "[Student Action] Gemini Raw Response:",
      JSON.stringify(response, null, 2)
    );
    console.log("[Student Action] Gemini Text Response:", assistantResponse);

    return (
      assistantResponse ||
      "Maaf, saya tidak dapat memproses permintaan Anda saat ini."
    );
  } catch (error: unknown) {
    console.error("[Student Action] Error processing question:", error);
    let errorMessage = "Error tidak diketahui";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Basic error, avoid leaking details
    return `❌ Maaf, terjadi kesalahan internal saat memproses pertanyaan Anda.`;
  }
}
