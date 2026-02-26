"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface AttendanceRecord {
  _id: string;
  name: string;
  timestamp: string;
  status: string;
  photo?: string;
  faceDescriptor?: number[];
  is_late?: boolean;
  late_minutes?: number;
  type: string;
}

export interface LeaveRequest {
  _id: string;
  type: string;
  reason: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "approved" | "rejected";
  created_at: Date;
}

export interface AggregatedStudentData {
  _id: string;
  name: string;
  nisn: string;
  class_name: string;
}

export async function getStudentsByTeacherId(): Promise<AggregatedStudentData[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  // 1. Get Teacher Profile
  const teacher = await db.collection("teachers").findOne({
    user_id: new ObjectId(session.user.id)
  });

  if (!teacher) return [];

  // 2. Get Class assigned to this teacher
  const classData = await db.collection("classes").findOne({
    teacher_id: teacher._id
  });

  if (!classData) return [];

  // 3. Get Students in this class
  const students = await db.collection("students").find({
    class_id: classData._id
  }).toArray();

  return students.map(s => ({
    _id: s._id.toString(),
    name: s.name,
    nisn: s.nisn,
    class_name: classData.class_name
  }));
}

export async function getManagerProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  
  // Try to find in teachers collection first (for department info)
  const teacherProfile = await db.collection("teachers").findOne({ 
    user_id: new ObjectId(session.user.id) 
  });

  return teacherProfile;
}

export async function getDepartmentStaffAttendance(month: number, year: number, query: string = "", page: number = 1, limit: number = 10) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const skip = (page - 1) * limit;

  // Get Manager's Department
  const managerProfile = await db.collection("teachers").findOne({ 
    user_id: new ObjectId(session.user.id) 
  });

  if (!managerProfile || !managerProfile.department) {
      return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  }

  const department = managerProfile.department;

  // 1. Find Staff IDs in the Department
  const staffPipeline = [
    {
      $lookup: {
        from: "teachers",
        localField: "_id",
        foreignField: "user_id",
        as: "profile"
      }
    },
    { $unwind: "$profile" },
    {
      $match: {
        "profile.department": department,
        "role": "staff",
        ...(query ? { "name": { $regex: query, $options: "i" } } : {})
      }
    },
    {
      $project: { _id: 1 }
    }
  ];

  const staffUsers = await db.collection("users").aggregate(staffPipeline).toArray();
  const staffIds = staffUsers.map((u: any) => u._id);

  if (staffIds.length === 0) {
      return {
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 }
      };
  }

  // 2. Query Staff Attendance directly
  const attendancePipeline = [
    {
      $addFields: {
        attendanceDate: { $toDate: "$created_at" }
      }
    },
    {
      $match: {
        staff_id: { $in: staffIds },
        $expr: {
          $and: [
            { $eq: [{ $year: "$attendanceDate" }, year] },
            { $eq: [{ $month: "$attendanceDate" }, month + 1] }
          ]
        }
      }
    },
    {
        $lookup: {
            from: "users",
            localField: "staff_id",
            foreignField: "_id",
            as: "user"
        }
    },
    { $unwind: "$user" },
    { $sort: { created_at: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: "$user.name",
              created_at: 1,
              is_late: 1,
              late_minutes: 1,
              photo: 1
            }
          }
        ]
      }
    }
  ];

  const result = await db.collection("staff_attendance").aggregate(attendancePipeline).toArray();
  const total = result[0]?.metadata[0]?.total || 0;
  const records = result[0]?.data || [];

  const formattedRecords = records.map((r: any) => ({
      ...r,
      _id: r._id.toString(),
      timestamp: new Date(r.created_at).toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit", 
        minute: "2-digit"
    })
  }));

  return {
    data: formattedRecords,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getDepartmentStaffAttendanceMonthly(month: number, year: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { staff: [], records: [], leaves: [] };

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  // Get Manager's Department
  const managerProfile = await db.collection("teachers").findOne({ 
    user_id: new ObjectId(session.user.id) 
  });

  if (!managerProfile || !managerProfile.department) {
      return { staff: [], records: [], leaves: [] };
  }

  const department = managerProfile.department;

  // 1. Find Users in the Department (Teacher or Staff)
  const usersInDept = await db.collection("teachers").aggregate([
    {
      $match: {
        department: department
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1, // teacher_id
        name: "$user.name",
        user_id: 1,
        role: "$user.role"
      }
    }
  ]).toArray();

  if (usersInDept.length === 0) {
      return { staff: [], records: [], leaves: [] };
  }

  // 2. Query Attendance (from multiple collections based on role)
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const teacherIds: ObjectId[] = [];
  const staffUserIds: ObjectId[] = []; // for staff role

  // Create a map to link User ID to Teacher ID (which is used as the main ID in the frontend list)
  const userIdToTeacherIdMap = new Map<string, string>();

  usersInDept.forEach((u: any) => {
      userIdToTeacherIdMap.set(u.user_id.toString(), u._id.toString());
      
      const role = (u.role || "").toLowerCase();
      
      if (role === "teacher" || role === "educator") {
          teacherIds.push(u._id); // u._id is teacher_id
      } else if (role === "staff") {
          staffUserIds.push(u.user_id);
      }
  });

  const records: any[] = [];

  // Query teacher attendance
  if (teacherIds.length > 0) {
      const teacherRecords = await db.collection("attendance").find({
          teacher_id: { $in: teacherIds },
          created_at: {
              $gte: startOfMonth,
              $lte: endOfMonth
          }
      }).toArray();
      
      teacherRecords.forEach((r: any) => {
          records.push({
              ...r,
              _id: r._id.toString(),
              staff_id: r.teacher_id.toString(), // Map to staff_id (which is teacher_id here)
              created_at: r.created_at
          });
      });
  }

  // Query staff attendance
  if (staffUserIds.length > 0) {
      const staffRecords = await db.collection("staff_attendance").find({
          staff_id: { $in: staffUserIds },
          created_at: {
              $gte: startOfMonth,
              $lte: endOfMonth
          }
      }).toArray();

      staffRecords.forEach((r: any) => {
          // Map the User ID (staff_id) back to the Teacher ID used in the list
          const mappedId = userIdToTeacherIdMap.get(r.staff_id.toString());
          
          if (mappedId) {
              records.push({
                  ...r,
                  _id: r._id.toString(),
                  staff_id: mappedId, // Use the mapped ID (Teacher ID)
                  created_at: r.created_at
              });
          }
      });
  }

  // 3. Query Leaves (assuming all use teacher_leave_requests)
  // If staff use a different collection, we need to handle that.
  // Assuming `teacher_leave_requests` covers everyone in `teachers` collection.
  const allTeacherIds = usersInDept.map((u: any) => u._id);
  
  const leaves = await db.collection("teacher_leave_requests").find({
    teacher_id: { $in: allTeacherIds },
    status: "approved",
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth
    }
  }).toArray();

  return {
    staff: usersInDept.map((t: any) => ({
      _id: t._id.toString(), // teacher_id
      name: t.name,
      user_id: t.user_id.toString()
    })),
    records: records,
    leaves: leaves.map((l: any) => ({
      ...l,
      _id: l._id.toString(),
      staff_id: l.teacher_id.toString(), // Map teacher_id to staff_id for frontend compatibility
      date: l.date,
      start_date: l.start_date || l.date,
      end_date: l.end_date || l.date
    }))
  };
}

export async function getManagerLeaveRequests(month?: number, year?: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
  
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    
    // Try to find teacher profile
    const teacherProfile = await db.collection("teachers").findOne({ 
        user_id: new ObjectId(session.user.id) 
    });

    const query: any = { 
        $or: [
            { user_id: new ObjectId(session.user.id) }
        ] 
    };
    
    if (teacherProfile) {
        query.$or.push({ teacher_id: teacherProfile._id });
    }

    if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        query.date = {
            $gte: start,
            $lt: end,
        };
    }

    const requests = await db.collection("teacher_leave_requests")
        .find(query)
        .sort({ created_at: -1 })
        .toArray();

    return requests.map(r => ({
        ...r,
        _id: r._id.toString(),
        teacher_id: r.teacher_id?.toString(),
        user_id: r.user_id?.toString(),
        startDate: r.start_date || r.date,
        endDate: r.end_date || r.date,
        created_at: r.created_at
    }));
}

export async function createManagerLeaveRequest(data: {
  type: string;
  reason: string;
  startDate: Date;
  endDate: Date;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  // Validate time (max 2 hours before)
  const now = new Date();
  const leaveStart = new Date(data.startDate);
  
  // If time is 00:00 (default from date picker), set to 07:00 (approximate shift start)
  if (leaveStart.getHours() === 0 && leaveStart.getMinutes() === 0) {
    leaveStart.setHours(7, 0, 0, 0);
  }

  const diff = leaveStart.getTime() - now.getTime();
  
  if (diff < 2 * 60 * 60 * 1000) {
    return { success: false, message: "Pengajuan izin harus dilakukan minimal 2 jam sebelum jam 07:00 pada tanggal izin." };
  }

  // Get Manager's Teacher Profile
  const teacherProfile = await db.collection("teachers").findOne({ 
    user_id: new ObjectId(session.user.id) 
  });

  if (!teacherProfile) {
      return { success: false, message: "Profil pegawai tidak ditemukan." };
  }

  // Insert into teacher_leave_requests
  const result = await db.collection("teacher_leave_requests").insertOne({
    teacher_id: teacherProfile._id,
    user_id: new ObjectId(session.user.id),
    teacher_name: session.user.name,
    type: data.type,
    reason: data.reason,
    date: new Date(data.startDate),
    start_date: new Date(data.startDate),
    end_date: new Date(data.endDate),
    status: "pending",
    created_at: new Date(),
    updated_at: new Date(),
    role: "manager",
    department: teacherProfile.department
  });

  if (result.acknowledged) {
      revalidatePath("/manager/leaves");
      revalidatePath("/manager/attendance");
      return { success: true, message: "Pengajuan izin berhasil dikirim." };
  } else {
      return { success: false, message: "Gagal menyimpan pengajuan izin." };
  }
}
