'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getMongoClientInstance } from "@/db/config/connection";
import { Db } from "mongodb";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-pro";

interface ClassDistribution {
  _id: string;
  count: number;
}

interface StatusDistribution {
  _id: string;
  count: number;
}

interface DatabaseContext {
  students: {
    total: number;
    genderDistribution: { male: number; female: number };
    classDistribution: ClassDistribution[];
    statusDistribution: StatusDistribution[];
  };
  teachers: {
    total: number;
    genderDistribution: { male: number; female: number };
  };
  achievements: {
    total: number;
    recentAchievements: Array<{
      title: string;
      level: string;
      date: string;
    }>;
  };
  academicRecords: {
    total: number;
    averageScores: {
      average: number;
      highest: number;
      lowest: number;
    };
  };
  attendance: {
    totalRecords: number;
    averageAttendance: number;
  };
}

async function getDatabaseContext(db: Db): Promise<DatabaseContext> {
  try {
    const students = await db.collection('students').find().toArray();
    const teachers = await db.collection('teachers').find().toArray();
    const achievements = await db.collection('achievements').find().toArray();
    const academicRecords = await db.collection('academic_records').find().toArray();
    const attendance = await db.collection('attendance').find().toArray();

    // Calculate distributions
    const classDistribution = students.reduce((acc: ClassDistribution[], student) => {
      const existing = acc.find(item => item._id === student.class);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: student.class, count: 1 });
      }
      return acc;
    }, []);

    const statusDistribution = students.reduce((acc: StatusDistribution[], student) => {
      const existing = acc.find(item => item._id === student.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: student.status, count: 1 });
      }
      return acc;
    }, []);

    return {
      students: {
        total: students.length,
        genderDistribution: { male: 0, female: 0 },
        classDistribution: classDistribution,
        statusDistribution: statusDistribution
      },
      teachers: {
        total: teachers.length,
        genderDistribution: { male: 0, female: 0 }
      },
      achievements: {
        total: achievements.length,
        recentAchievements: achievements.map(ach => ({
          title: ach.title,
          level: ach.category,
          date: ach.date.toISOString().split('T')[0]
        }))
      },
      academicRecords: {
        total: academicRecords.length,
        averageScores: {
          average: academicRecords.reduce((sum, rec) => sum + rec.score, 0) / academicRecords.length,
          highest: Math.max(...academicRecords.map(rec => rec.score)),
          lowest: Math.min(...academicRecords.map(rec => rec.score))
        }
      },
      attendance: {
        totalRecords: attendance.length,
        averageAttendance: attendance.reduce((sum, a) => sum + (a.status === 'hadir' ? 1 : 0), 0) / attendance.length
      }
    };
  } catch (error) {
    console.error('Error getting database context:', error);
    throw error;
  }
}

export async function processQuestion(question: string): Promise<string> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db();
    const dbContext = await getDatabaseContext(db);
    
    const genAI = new GoogleGenerativeAI(API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const safetySettings = [
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

    const systemPrompt = `Anda adalah asisten AI yang membantu mengelola data pesantren. 
    Anda memiliki akses ke data siswa, guru, prestasi, dan informasi akademik.
    Gunakan konteks berikut untuk menjawab pertanyaan dengan akurat dan informatif.
    Jika tidak yakin dengan jawaban, katakan bahwa Anda tidak memiliki informasi yang cukup.
    Selalu berikan jawaban dalam bahasa Indonesia yang sopan dan profesional.`;

    const prompt = `${systemPrompt}\n\nKonteks:\n${JSON.stringify(dbContext, null, 2)}\n\nPertanyaan: ${question}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error processing question:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const client = await getMongoClientInstance();
    const db = client.db('crand');
    const dbContext = await getDatabaseContext(db);

    const genAI = new GoogleGenerativeAI(API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const chat = model.startChat({
      history: messages,
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
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
      ],
    });

    const result = await chat.sendMessage(`
      Context: ${JSON.stringify(dbContext)}
      Question: ${messages[messages.length - 1].content}
    `);

    const response = await result.response;
    const text = response.text();

    return Response.json({ text });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 