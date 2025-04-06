'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { Student, Achievement } from '@/types/database';
import { ObjectId } from 'mongodb';

interface AchievementWithStudent extends Achievement {
  student: Student;
}

interface ClassDistribution {
  _id: string;
  count: number;
}

export async function processQuestion(question: string): Promise<string> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const normalizedQuestion = question.toLowerCase();

    // Handle questions about specific student
    if (normalizedQuestion.includes('santri bernama') || normalizedQuestion.includes('info santri')) {
      // Extract the name more accurately
      let studentName;
      if (normalizedQuestion.includes('santri bernama')) {
        studentName = question.split('santri bernama')[1].trim();
      } else if (normalizedQuestion.includes('info santri')) {
        studentName = question.split('info santri')[1].trim();
      }

      if (studentName) {
        console.log("Searching for student:", studentName); // Debug log

        // Find the student with case-insensitive name search
        const student = await db.collection('students').findOne({
          name: { $regex: `.*${studentName}.*`, $options: 'i' }
        });

        console.log("Found student:", student); // Debug log

        if (!student) {
          return `Maaf, tidak dapat menemukan data santri dengan nama "${studentName}".`;
        }

        // Get student's achievements
        const achievements = await db.collection('achievements')
          .find({
            studentId: new ObjectId(student._id)
          })
          .sort({ date: -1 })
          .limit(3)
          .toArray();

        // Get student's academic records
        const academicRecords = await db.collection('academic_records')
          .find({
            studentId: new ObjectId(student._id)
          })
          .sort({ year: -1, semester: -1 })
          .limit(1)
          .toArray();

        // Get student's attendance
        const currentMonth = new Date();
        currentMonth.setDate(1);
        const attendance = await db.collection('attendance')
          .find({
            studentId: new ObjectId(student._id),
            date: { $gte: currentMonth }
          })
          .toArray();

        let response = `Informasi tentang santri ${student.name}:\n\n`;
        response += `Kelas: ${student.class}\n`;
        response += `Status: ${student.status}\n`;
        response += `Jenis Kelamin: ${student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}\n`;
        if (student.enrollmentDate) {
          response += `Tanggal Masuk: ${new Date(student.enrollmentDate).toLocaleDateString('id-ID')}\n`;
        }
        response += '\n';
        
        if (achievements.length > 0) {
          response += 'Prestasi terakhir:\n';
          achievements.forEach((achievement, index) => {
            response += `${index + 1}. ${achievement.title}\n`;
            if (achievement.description) {
              response += `   Detail: ${achievement.description}\n`;
            }
            response += `   Kategori: ${achievement.category}\n`;
            response += `   Tingkat: ${achievement.level}\n`;
            if (achievement.date) {
              response += `   Tanggal: ${new Date(achievement.date).toLocaleDateString('id-ID')}\n`;
            }
          });
          response += '\n';
        }

        if (academicRecords.length > 0) {
          const latestRecord = academicRecords[0];
          response += `Akademik (${latestRecord.semester} ${latestRecord.year}):\n`;
          response += `Rata-rata: ${latestRecord.average?.toFixed(2) || 'Belum ada'}\n`;
          if (latestRecord.rank) {
            response += `Peringkat: ${latestRecord.rank}\n`;
          }
          response += '\n';
        }

        if (attendance.length > 0) {
          const present = attendance.filter(a => a.status === 'present').length;
          const total = attendance.length;
          const percentage = (present / total * 100).toFixed(1);
          response += `Kehadiran bulan ini: ${percentage}% (${present}/${total} hari)\n`;
        }

        return response;
      }
    }

    // Handle questions about student achievements
    if (normalizedQuestion.includes('prestasi') || normalizedQuestion.includes('berprestasi')) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const achievements = await db.collection('achievements')
        .aggregate([
          {
            $match: {
              date: { $gte: oneWeekAgo }
            }
          },
          {
            $lookup: {
              from: 'students',
              localField: 'studentId',
              foreignField: '_id',
              as: 'student'
            }
          },
          {
            $unwind: '$student'
          },
          {
            $sort: { date: -1 }
          }
        ]).toArray();

      if (achievements.length === 0) {
        return "Tidak ada prestasi santri yang tercatat dalam minggu ini.";
      }

      let response = "Berikut adalah santri yang berprestasi dalam minggu ini:\n\n";
      achievements.forEach((achievement, index) => {
        response += `${index + 1}. ${achievement.student.name} (${achievement.student.class})\n`;
        response += `   Prestasi: ${achievement.title}\n`;
        if (achievement.description) {
          response += `   Detail: ${achievement.description}\n`;
        }
        response += `   Kategori: ${achievement.category}\n`;
        response += `   Tingkat: ${achievement.level}\n`;
        response += `   Tanggal: ${new Date(achievement.date).toLocaleDateString('id-ID')}\n\n`;
      });

      return response;
    }

    // Handle questions about total students
    if (normalizedQuestion.includes('jumlah santri') || normalizedQuestion.includes('total santri')) {
      const totalStudents = await db.collection('students').countDocuments();
      const statusCounts = await db.collection('students').aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      let response = `Total santri terdaftar: ${totalStudents} orang\n\n`;
      response += "Detail status santri:\n";
      statusCounts.forEach(status => {
        response += `${status._id}: ${status.count} orang\n`;
      });

      return response;
    }

    // Handle questions about class distribution
    if (normalizedQuestion.includes('kelas') || normalizedQuestion.includes('tingkat')) {
      const classDistribution = await db.collection('students')
        .aggregate<ClassDistribution>([
          {
            $group: {
              _id: '$class',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]).toArray();

      if (classDistribution.length === 0) {
        return "Tidak ada data distribusi kelas yang tersedia.";
      }

      let response = "Distribusi santri per kelas:\n\n";
      let totalSantri = 0;
      classDistribution.forEach(cls => {
        response += `Kelas ${cls._id}: ${cls.count} santri\n`;
        totalSantri += cls.count;
      });
      response += `\nTotal santri: ${totalSantri} orang`;

      return response;
    }

    // Handle questions about recent achievements
    if (normalizedQuestion.includes('prestasi terbaru') || normalizedQuestion.includes('pencapaian terbaru')) {
      const recentAchievements = await db.collection('achievements')
        .aggregate([
          {
            $sort: { date: -1 }
          },
          {
            $limit: 5
          },
          {
            $lookup: {
              from: 'students',
              localField: 'studentId',
              foreignField: '_id',
              as: 'student'
            }
          },
          {
            $unwind: '$student'
          }
        ]).toArray();

      if (recentAchievements.length === 0) {
        return "Belum ada prestasi yang tercatat.";
      }

      let response = "Prestasi terbaru santri:\n\n";
      recentAchievements.forEach((achievement, index) => {
        response += `${index + 1}. ${achievement.student.name} (${achievement.student.class})\n`;
        response += `   Prestasi: ${achievement.title}\n`;
        if (achievement.description) {
          response += `   Detail: ${achievement.description}\n`;
        }
        response += `   Kategori: ${achievement.category}\n`;
        response += `   Tingkat: ${achievement.level}\n`;
        if (achievement.date) {
          response += `   Tanggal: ${new Date(achievement.date).toLocaleDateString('id-ID')}\n`;
        }
        response += '\n';
      });

      return response;
    }

    // Default response for unrecognized questions
    return `Maaf, saya tidak dapat memahami pertanyaan Anda. Anda dapat menanyakan tentang:
1. Prestasi santri (minggu ini atau terbaru)
2. Jumlah total santri dan status
3. Distribusi kelas
4. Informasi santri tertentu (contoh: "info santri bernama Ahmad")`;

  } catch (error) {
    console.error('Error processing question:', error);
    throw error;
  }
} 