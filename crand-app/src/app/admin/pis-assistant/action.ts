'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { Student, Achievement } from '@/types/database';
import { ObjectId, Document, WithId } from 'mongodb';

interface AchievementWithStudent extends Achievement {
  student: Student;
}

interface ClassDistribution {
  _id: string;
  count: number;
}

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
        response += `Jenis Kelamin: ${getGenderDisplay(student.gender)}\n`;
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

    // Handle questions about specific teacher
    if (normalizedQuestion.includes('ustadz bernama') || normalizedQuestion.includes('info ustadz')) {
      let teacherName;
      if (normalizedQuestion.includes('ustadz bernama')) {
        teacherName = question.split('ustadz bernama')[1].trim();
      } else if (normalizedQuestion.includes('info ustadz')) {
        teacherName = question.split('info ustadz')[1].trim();
      }

      if (teacherName) {
        console.log("Searching for teacher:", teacherName); // Debug log

        try {
          // Try different collections to find the teacher
          let allTeachers: any[] = [];
          
          // Get collections available in the database
          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map(c => c.name);
          console.log("Available collections:", collectionNames);
          
          // Check teachers collection
          if (collectionNames.includes("teachers")) {
            const teachersData = await db.collection("teachers").find({}).toArray();
            console.log(`Found ${teachersData.length} records in teachers collection`);
            allTeachers = [...allTeachers, ...teachersData];
          }
          
          // Check teacher collection (singular)
          if (collectionNames.includes("teacher")) {
            const teacherData = await db.collection("teacher").find({}).toArray();
            console.log(`Found ${teacherData.length} records in teacher collection`);
            allTeachers = [...allTeachers, ...teacherData];
          }
          
          // Check users collection for teachers
          if (collectionNames.includes("users")) {
            // Try different strategies to find teachers in users collection
            // Strategy 1: Look for role field
            const teacherUsers = await db.collection("users").find({ 
              $or: [
                { role: { $in: ["teacher", "ustadz", "ustadzah", "guru"] } },
                { userType: { $in: ["teacher", "ustadz", "ustadzah", "guru"] } }
              ]
            }).toArray();
            
            // Strategy 2: If no teachers found with roles, check if there's any type indicator
            if (teacherUsers.length === 0) {
              const allUsers = await db.collection("users").find({}).toArray();
              const potentialTeachers = allUsers.filter(user => {
                // Look for any field that might indicate this is a teacher
                return Object.values(user).some(value => 
                  typeof value === 'string' && 
                  ["teacher", "ustadz", "ustadzah", "guru"].some(term => 
                    value.toLowerCase().includes(term)
                  )
                );
              });
              console.log(`Found ${potentialTeachers.length} potential teachers in users collection`);
              allTeachers = [...allTeachers, ...potentialTeachers];
            } else {
              console.log(`Found ${teacherUsers.length} teachers in users collection`);
              allTeachers = [...allTeachers, ...teacherUsers];
            }
          }
          
          console.log(`Combined total of ${allTeachers.length} teachers from all collections`);
          
          // Remove duplicates (if any) based on _id or name
          const uniqueTeachers = allTeachers.filter((teacher, index, self) => {
            if (!teacher._id && !teacher.name) return false;
            
            // If we have _id, use that for uniqueness
            if (teacher._id) {
              return index === self.findIndex(t => 
                t._id && t._id.toString() === teacher._id.toString()
              );
            }
            
            // Otherwise use name
            return index === self.findIndex(t => 
              t.name && teacher.name && t.name.toLowerCase() === teacher.name.toLowerCase()
            );
          });
          
          console.log(`Found ${uniqueTeachers.length} unique teachers after deduplication`);
          
          // Try multiple search strategies
          let matchedTeacher = null;
          
          if (uniqueTeachers.length > 0) {
            matchedTeacher = uniqueTeachers.find(t => {
              if (!t.name) return false;
              
              // Try exact match first
              if (t.name.toLowerCase() === teacherName.toLowerCase()) {
                return true;
              }
              
              // Try partial match
              if (t.name.toLowerCase().includes(teacherName.toLowerCase())) {
                return true;
              }
              
              // Try splitting the name and matching parts
              const nameParts = t.name.toLowerCase().split(' ');
              const searchParts = teacherName.toLowerCase().split(' ');
              return nameParts.some((part: string) => searchParts.includes(part));
            });
          }
          
          if (!matchedTeacher) {
            console.log("No teacher found with name:", teacherName);
            if (uniqueTeachers.length > 0) {
              console.log("Available teachers:", uniqueTeachers.map(t => t.name).join(', '));
            } else {
              console.log("No teachers found in any collection");
            }
            return `Maaf, tidak dapat menemukan data ustadz dengan nama "${teacherName}".`;
          }
          
          console.log("Matched teacher:", JSON.stringify(matchedTeacher, null, 2));
          
          let response = `Informasi tentang ustadz ${matchedTeacher.name}:\n\n`;
          
          // Create a normalized object with standard field names
          const teacher = {
            name: matchedTeacher.name,
            position: matchedTeacher.position || matchedTeacher.jabatan || matchedTeacher.title || matchedTeacher.role || "Guru",
            status: matchedTeacher.status || "Aktif",
            joinDate: matchedTeacher.joinDate || matchedTeacher.join_date || matchedTeacher.tanggalBergabung || matchedTeacher.created_at,
            phone: matchedTeacher.phone || matchedTeacher.phoneNumber || matchedTeacher.telepon || matchedTeacher.noTelepon,
            email: matchedTeacher.email,
            specialization: matchedTeacher.specialization || matchedTeacher.keahlian || matchedTeacher.expertise || matchedTeacher.subject,
            address: matchedTeacher.address || matchedTeacher.alamat,
          };
          
          // Add all available fields from the teacher object
          if (teacher.position) {
            response += `Jabatan: ${teacher.position}\n`;
          }
          
          if (teacher.status) {
            response += `Status: ${teacher.status}\n`;
          }
          
          if (teacher.joinDate) {
            const date = new Date(teacher.joinDate);
            if (!isNaN(date.getTime())) {
              response += `Tanggal Bergabung: ${date.toLocaleDateString('id-ID')}\n`;
            }
          }
          
          if (teacher.phone) {
            response += `Nomor Telepon: ${teacher.phone}\n`;
          }
          
          if (teacher.email) {
            response += `Email: ${teacher.email}\n`;
          }
          
          if (teacher.specialization) {
            response += `Spesialisasi: ${teacher.specialization}\n`;
          }
          
          if (teacher.address) {
            response += `Alamat: ${teacher.address}\n`;
          }

          return response;
        } catch (error) {
          console.error("Error fetching teacher data:", error);
          return `Maaf, terjadi kesalahan saat mencari data ustadz dengan nama "${teacherName}".`;
        }
      }
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

    // Handle questions about total teachers
    if (normalizedQuestion.includes('jumlah ustadz') || normalizedQuestion.includes('total ustadz')) {
      try {
        // Count teachers from multiple collections
        let totalTeachers = 0;
        const statusMap = new Map();
        
        // Get collections available in the database
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Check teachers collection
        if (collectionNames.includes("teachers")) {
          const teachers = await db.collection("teachers").find({}).toArray();
          totalTeachers += teachers.length;
          
          // Count by status
          teachers.forEach(teacher => {
            const status = teacher.status || 'Aktif';
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
          });
        }
        
        // Check teacher collection (singular)
        if (collectionNames.includes("teacher")) {
          const teachers = await db.collection("teacher").find({}).toArray();
          totalTeachers += teachers.length;
          
          // Count by status
          teachers.forEach(teacher => {
            const status = teacher.status || 'Aktif';
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
          });
        }
        
        // Check users collection for teachers
        if (collectionNames.includes("users")) {
          const teacherUsers = await db.collection("users").find({ 
            $or: [
              { role: { $in: ["teacher", "ustadz", "ustadzah", "guru"] } },
              { userType: { $in: ["teacher", "ustadz", "ustadzah", "guru"] } }
            ]
          }).toArray();
          
          totalTeachers += teacherUsers.length;
          
          // Count by status
          teacherUsers.forEach(teacher => {
            const status = teacher.status || 'Aktif';
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
          });
        }
        
        let response = `Total ustadz terdaftar: ${totalTeachers} orang\n\n`;
        
        if (statusMap.size > 0) {
          response += "Detail status ustadz:\n";
          statusMap.forEach((count, status) => {
            response += `${status}: ${count} orang\n`;
          });
        }
        
        return response;
      } catch (error) {
        console.error("Error fetching teacher count:", error);
        return "Maaf, terjadi kesalahan saat mengambil data jumlah ustadz.";
      }
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

    // Default response for unrecognized questions
    return `Maaf, saya tidak dapat memahami pertanyaan Anda. Anda dapat menanyakan tentang:
1. Jumlah total santri dan status
2. Jumlah total ustadz dan status
3. Distribusi kelas
4. Informasi santri tertentu (contoh: "info santri bernama Ahmad")
5. Informasi ustadz tertentu (contoh: "info ustadz bernama Umar")`;

  } catch (error) {
    console.error('Error processing question:', error);
    throw error;
  }
} 