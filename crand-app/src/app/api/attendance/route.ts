import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import { isValidAttendanceTime, getAttendanceBuffer } from "@/lib/shift-utils";
import { withRetry } from "@/lib/retry";

export async function POST(request: Request) {
  try {
    return await withRetry(async () => {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const formData = await request.formData();
      const photo = formData.get("photo") as string;
      const faceDescriptorStr = formData.get("faceDescriptor") as string;
      const type = (formData.get("type") as string) || "teacher";
      const latStr = formData.get("latitude") as string | null;
      const lngStr = formData.get("longitude") as string | null;
      // const name = formData.get("name") as string | null; // Not strictly needed if we look up user

      if (!photo || !faceDescriptorStr) {
        return NextResponse.json(
          { success: false, message: "Data wajah tidak lengkap" },
          { status: 400 }
        );
      }

      let faceDescriptor: number[];
      try {
        faceDescriptor = JSON.parse(faceDescriptorStr);
        if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
           throw new Error("Invalid descriptor format");
        }
      } catch (e) {
        return NextResponse.json(
          { success: false, message: "Format data wajah tidak valid" },
          { status: 400 }
        );
      }

      const client = await getMongoClientInstance();
      const db = client.db("pesantren_db");
      const mongoSession = client.startSession();

      try {
        let resultResponse: NextResponse | null = null;

        await mongoSession.withTransaction(async () => {
          const faceDataCollection = db.collection("face_data");
          const threshold = 0.6;

          // --- Location Validation ---
          const isWithinRadius = (
            userLat: number,
            userLng: number,
            locations: Array<{ lat: number; lng: number }>,
            radius: number
          ): boolean => {
            const R = 6371e3; // meters
            for (const location of locations) {
              const φ1 = (userLat * Math.PI) / 180;
              const φ2 = (location.lat * Math.PI) / 180;
              const Δφ = ((location.lat - userLat) * Math.PI) / 180;
              const Δλ = ((location.lng - userLng) * Math.PI) / 180;
              const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;
              if (distance <= radius) return true;
            }
            return false;
          };

          if (!latStr || !lngStr) {
            resultResponse = NextResponse.json(
              { success: false, message: "Data lokasi diperlukan untuk absensi" },
              { status: 400 }
            );
            return; // Abort transaction logic
          }

          const userLat = parseFloat(latStr);
          const userLng = parseFloat(lngStr);
          if (Number.isNaN(userLat) || Number.isNaN(userLng)) {
            resultResponse = NextResponse.json(
              { success: false, message: "Data lokasi tidak valid" },
              { status: 400 }
            );
            return;
          }

          const allowedLocations = [
            { lat: -5.9943049319879425, lng: 106.04812321979192 },
            { lat: -5.979029363145886, lng: 106.0590577982583 },
          ];
          const within = isWithinRadius(userLat, userLng, allowedLocations, 500);
          if (!within) {
            resultResponse = NextResponse.json(
              {
                success: false,
                message: "Absensi hanya dapat dilakukan di lokasi yang ditentukan",
              },
              { status: 400 }
            );
            return;
          }

          // --- Face Matching Helper ---
          const calculateDistance = (d1: number[], d2: number[]) => {
            return Math.sqrt(d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0));
          };

          let user: any = null;
          let collectionName = "";
          let attendanceCollectionName = "";
          let userIdField = ""; // e.g., teacher_id, admin_id

          // --- Role Specific Logic ---
          if (type === "teacher" || type === "educator") {
            collectionName = "teachers";
            attendanceCollectionName = "attendance";
            userIdField = "teacher_id";
            
            // Use default buffer from shift-utils
            const timeCheck = isValidAttendanceTime(new Date(), type as any);
            if (!timeCheck.isValid) {
              resultResponse = NextResponse.json({ success: false, message: timeCheck.message }, { status: 400 });
              return;
            }

            user = await db.collection("teachers").findOne({ user_id: new ObjectId(session.user.id) }, { session: mongoSession });

            if (!user) {
              resultResponse = NextResponse.json({ success: false, message: `${type === 'teacher' ? 'Guru' : 'Educator'} tidak ditemukan` }, { status: 404 });
              return;
            }

            // Check for approved leave request
            if (timeCheck.schedule) {
               const startOfDay = new Date();
               startOfDay.setHours(0, 0, 0, 0);
               const endOfDay = new Date();
               endOfDay.setHours(23, 59, 59, 999);

               const scheduleKey = `${timeCheck.schedule.start}-${timeCheck.schedule.end}`;
               
               const leaveRequest = await db.collection("teacher_leave_requests").findOne({
                 teacher_id: user._id,
                 date: { $gte: startOfDay, $lte: endOfDay },
                 status: "approved",
                 $or: [
                   { slot_key: "full_day" },
                   { slot_key: scheduleKey }
                 ]
               }, { session: mongoSession });

               if (leaveRequest) {
                  resultResponse = NextResponse.json({ 
                    success: false, 
                    message: `Absensi ditolak: Anda memiliki izin yang disetujui (${leaveRequest.reason}) untuk jadwal ini.` 
                  }, { status: 400 });
                  return;
               }
            }

            // Check duplicate
            if (timeCheck.schedule) {
               const startOfDay = new Date();
               startOfDay.setHours(0, 0, 0, 0);
               const existing = await db.collection(attendanceCollectionName).find({
                 [userIdField]: user._id,
                 created_at: { $gte: startOfDay }
               }, { session: mongoSession }).toArray();

               const isDuplicate = existing.some((record) => {
                  const recordDate = new Date(record.created_at);
                  const localRecordDate = new Date(recordDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
                  const recordMinutes = localRecordDate.getHours() * 60 + localRecordDate.getMinutes();
                  const buffer = getAttendanceBuffer(type as any);
                  return (recordMinutes >= (timeCheck.schedule!.start - buffer) && recordMinutes <= timeCheck.schedule!.end);
               });

               if (isDuplicate) {
                 resultResponse = NextResponse.json({ success: false, message: "Anda sudah melakukan absensi untuk jadwal ini." }, { status: 400 });
                 return;
               }
            }

          } else if (type === "admin" || type === "staff" || type === "manager") {
            collectionName = "users";
            if (type === "admin") {
              attendanceCollectionName = "admin_attendance";
              userIdField = "admin_id";
            } else if (type === "manager") {
              attendanceCollectionName = "manager_attendance";
              userIdField = "manager_id";
            } else if (type === "staff") {
              attendanceCollectionName = "staff_attendance";
              userIdField = "staff_id";
            } else if (type === "hrd") {
              attendanceCollectionName = "hrd_attendance";
              userIdField = "hrd_id";
            } else if (type === "adminhrd") {
              attendanceCollectionName = "adminhrd_attendance";
              userIdField = "adminhrd_id";
            }

            // Use default buffer from shift-utils
            const timeCheck = isValidAttendanceTime(new Date(), type as any);
            if (!timeCheck.isValid) {
              resultResponse = NextResponse.json({ success: false, message: timeCheck.message }, { status: 400 });
              return;
            }

            user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) }, { session: mongoSession });
            
            if (!user) {
               resultResponse = NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
               return;
            }

            // Verify role
            if (type === "manager") {
                 if (user.role !== "manager") {
                      // Check if they are a teacher with department (Manager fallback)
                      const teacherProfile = await db.collection("teachers").findOne({ user_id: user._id }, { session: mongoSession });
                      if (!teacherProfile || !teacherProfile.department) {
                         resultResponse = NextResponse.json({ success: false, message: "Akses ditolak: Bukan Manager" }, { status: 403 });
                         return;
                      }
                 }
            } else if (user.role !== type) {
               resultResponse = NextResponse.json({ success: false, message: `Role tidak sesuai (Exp: ${type}, Act: ${user.role})` }, { status: 403 });
               return;
            }

            // Check for approved leave request (Unified for Manager/Staff using teacher_leave_requests)
            // Assuming Manager/Staff leave requests are stored in 'teacher_leave_requests'
            // We need to find the request by user_id
            if (timeCheck.schedule) {
               const startOfDay = new Date();
               startOfDay.setHours(0, 0, 0, 0);
               const endOfDay = new Date();
               endOfDay.setHours(23, 59, 59, 999);

               // For Manager/Staff, they usually have full day leave or specific dates
               // We check if there is an approved leave for today
               const leaveRequest = await db.collection("teacher_leave_requests").findOne({
                 user_id: user._id, // Look up by user_id for manager/staff
                 status: "approved",
                 date: { $gte: startOfDay, $lte: endOfDay }
               }, { session: mongoSession });

               if (leaveRequest) {
                  resultResponse = NextResponse.json({ 
                    success: false, 
                    message: `Absensi ditolak: Anda memiliki izin yang disetujui (${leaveRequest.reason}) untuk hari ini.` 
                  }, { status: 400 });
                  return;
               }
            }


             // Check duplicate
            if (timeCheck.schedule) {
               const startOfDay = new Date();
               startOfDay.setHours(0, 0, 0, 0);
               const existing = await db.collection(attendanceCollectionName).find({
                 [userIdField]: user._id,
                 created_at: { $gte: startOfDay }
               }, { session: mongoSession }).toArray();

               const isDuplicate = existing.some((record) => {
                  const recordDate = new Date(record.created_at);
                  const localRecordDate = new Date(recordDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
                  const recordMinutes = localRecordDate.getHours() * 60 + localRecordDate.getMinutes();
                  const buffer = getAttendanceBuffer(type as any);
                  return (recordMinutes >= (timeCheck.schedule!.start - buffer) && recordMinutes <= timeCheck.schedule!.end);
               });

               if (isDuplicate) {
                 resultResponse = NextResponse.json({ success: false, message: "Anda sudah melakukan absensi untuk jadwal ini." }, { status: 400 });
                 return;
               }
            }
          } else {
             resultResponse = NextResponse.json({ success: false, message: "Tipe absensi tidak valid" }, { status: 400 });
             return;
          }

          // --- User Name Retrieval (if user object doesn't have name, fetch from users if needed) ---
          let userName = user.name;
          if (!userName && (type === "teacher" || type === "educator")) {
             // Teacher/Educator might be linked to user
             const u = await db.collection("users").findOne({ _id: user.user_id }, { session: mongoSession });
             userName = u?.name;
          }
          if (!userName) {
             resultResponse = NextResponse.json({ success: false, message: "Data nama tidak ditemukan" }, { status: 404 });
             return;
          }

          // --- Face Recognition Logic ---
          const existingFaceData = await faceDataCollection.findOne({
            user_id: user._id,
            user_type: type
          }, { session: mongoSession });

          let isNewFace = false;

          if (!existingFaceData) {
            // Register new face
            await faceDataCollection.insertOne({
              user_id: user._id,
              user_type: type,
              face_encoding: faceDescriptor, // Storing as face_encoding as requested
              name: userName,
              created_at: new Date(),
              updated_at: new Date()
            }, { session: mongoSession });
            isNewFace = true;
          } else {
            // Match face
            // Note: existingFaceData.face_encoding might be undefined if old data used 'descriptor'
            // We should check both or migrate. For now assuming new structure or handling both.
            const storedDescriptor = existingFaceData.face_encoding || existingFaceData.descriptor;
            
            if (!storedDescriptor) {
               // Fallback: update with new descriptor if somehow missing but record exists? 
               // Or fail. Let's fail safely or update. 
               // Better to update if empty? No, security risk.
               // Let's assume valid data.
               resultResponse = NextResponse.json({ success: false, message: "Data wajah rusak, hubungi admin." }, { status: 500 });
               return;
            }

            const distance = calculateDistance(faceDescriptor, storedDescriptor);
            if (distance >= threshold) {
              resultResponse = NextResponse.json({
                success: false,
                message: "Wajah tidak cocok. Harap absen dengan wajah Anda sendiri"
              }, { status: 400 });
              return;
            }
          }

          // --- Record Attendance ---
          const timeCheck = isValidAttendanceTime(new Date(), type as any); // Re-calc to be safe or reuse
          
          const attendanceDoc = {
            [userIdField]: user._id,
            name: userName,
            date: new Date(),
            type: type,
            face_descriptor: faceDescriptor, // Keep for history/audit if needed, or remove to save space
            created_at: new Date(),
            updated_at: new Date(),
            is_late: Boolean(timeCheck.isLate),
            late_minutes: timeCheck.lateMinutes || 0,
            location: {
                lat: userLat,
                lng: userLng
            }
          };

          const attResult = await db.collection(attendanceCollectionName).insertOne(attendanceDoc, { session: mongoSession });

          // --- Audit Trail ---
          await db.collection("audit_logs").insertOne({
            action: "ATTENDANCE",
            collection: attendanceCollectionName,
            document_id: attResult.insertedId,
            user_id: session.user.id,
            details: {
                type,
                is_new_face: isNewFace,
                is_late: attendanceDoc.is_late
            },
            timestamp: new Date()
          }, { session: mongoSession });

          const timestamp = new Date().toLocaleString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          resultResponse = NextResponse.json({
            success: true,
            message: isNewFace ? "Wajah berhasil didaftarkan untuk pertama kali" : `Absensi ${type} berhasil`,
            name: userName,
            timestamp: timestamp,
            isNewFace
          });
        });

        return resultResponse!;

      } catch (error) {
        console.error("Transaction aborted:", error);
        throw error; // Will be caught by outer try/catch and handled by retry if applicable
      } finally {
        await mongoSession.endSession();
      }
    });
  } catch (error) {
    console.error("Error in attendance API:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
