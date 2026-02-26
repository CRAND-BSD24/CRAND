"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export interface TeacherFilters {
  position?: string;
  branch?: string;
  activeStatus?: string;
  employeeStatus?: string;
  gender?: string;
  education?: string;
  department?: string;
  query?: string;
}

export async function searchTeachers(filters: TeacherFilters) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const match: any = {};

  if (filters.position) match.position = filters.position;
  if (filters.branch) match.branch_office = filters.branch;
  if (filters.activeStatus) match.active_status = filters.activeStatus;
  if (filters.employeeStatus) match.status_teacher = filters.employeeStatus;
  if (filters.gender) match.gender = filters.gender;
  if (filters.education) match.education = filters.education;
  if (filters.department) match.department = filters.department;

  const pipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user_data",
      },
    },
    { $unwind: "$user_data" },
  ];

  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim();
    pipeline.push({
      $match: {
        $or: [
          { nip: { $regex: q, $options: "i" } },
          { "user_data.name": { $regex: q, $options: "i" } },
          { "user_data.phone_number": { $regex: q, $options: "i" } },
          { "user_data.email": { $regex: q, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({
    $project: {
      _id: { $toString: "$_id" },
      nip: 1,
      address: 1,
      position: 1,
      work_time: "$start_work_date",
      birth_date: 1,
      status: "$active_status",
      work_type: 1,
      shift_name: 1,
      department: 1,
      branch_office: 1,
      education: 1,
      gender: 1,
      employee_status: 1,
      name: "$user_data.name",
      phone_number: "$user_data.phone_number",
      user_id: {
        _id: { $toString: "$user_data._id" },
        email: "$user_data.email",
        role: "$user_data.role",
        profile_picture: "$user_data.profile_picture",
      },
    },
  });

  const result = await db.collection("teachers").aggregate(pipeline).toArray();
  return JSON.stringify(result);
}

export async function bulkDeleteTeachers(ids: string[]) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // Get user_ids first
      const teachers = await db
        .collection("teachers")
        .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } })
        .toArray();

      const userIds = teachers.map((t) => t.user_id);

      // Delete from teachers collection
      await db.collection("teachers").deleteMany(
        { _id: { $in: ids.map((id) => new ObjectId(id)) } },
        { session }
      );

      // Delete from users collection
      if (userIds.length > 0) {
        await db.collection("users").deleteMany(
          { _id: { $in: userIds } },
          { session }
        );
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting teachers:", error);
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getTeachersFullForExcel(filters: TeacherFilters) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const match: any = {};

  if (filters.position) match.position = filters.position;
  if (filters.branch) match.branch_office = filters.branch;
  if (filters.activeStatus) match.active_status = filters.activeStatus;
  if (filters.employeeStatus) match.status_teacher = filters.employeeStatus;
  if (filters.gender) match.gender = filters.gender;
  if (filters.education) match.education = filters.education;
  if (filters.department) match.department = filters.department;

  const pipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "users",
        localField: "supervisor_user_id",
        foreignField: "_id",
        as: "supervisor",
      },
    },
    {
      $unwind: {
        path: "$supervisor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        nip: 1,
        title_prefix: 1,
        title_suffix: 1,
        nik: 1,
        npwp: 1,
        email: "$user.email",
        role: "$user.role",
        address: 1,
        city: 1,
        birth_date: 1,
        phone_number: "$user.phone_number",
        gender: 1,
        education: 1,
        start_work_date: 1,
        status_teacher: 1,
        active_status: 1,
        position: 1,
        grade: 1,
        department: 1,
        supervisor_user_id: { $toString: "$supervisor_user_id" },
        supervisor_name: "$supervisor.name",
        bank_name: 1,
        bank_account_number: 1,
        bank_account_name: 1,
        retirement_date: 1,
        work_type: 1,
        shift_name: 1,
        branch_office: 1,
        head_office: 1,
        payroll_period: 1,
        payroll_type: 1,
        account_activation: {
          $cond: [{ $ifNull: ["$user.is_active", false] }, "Ya", "Tidak"],
        },
        notes: 1,
        user_name: "$user.name",
        user_id: { $toString: "$user._id" },
      },
    },
  ];

  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim();
    pipeline.push({
      $match: {
        $or: [
          { nip: { $regex: q, $options: "i" } },
          { user_name: { $regex: q, $options: "i" } },
          { phone_number: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      },
    });
  }

  const rows = await db.collection("teachers").aggregate(pipeline).toArray();
  return rows;
}

export interface CreateTeacherFullInput {
  nip: string;
  name: string;
  email: string;
  title_prefix?: string;
  title_suffix?: string;
  nik?: string;
  npwp?: string;
  address?: string;
  city?: string;
  birth_date?: string;
  phone_number?: string;
  gender?: string;
  education?: string;
  start_work_date?: string;
  status_teacher?: string;
  active_status: string;
  position: string;
  grade?: string;
  department: string;
  supervisor_user_id?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  retirement_date?: string;
  photo_base64?: string;
  kk_file_base64?: string;
  identity_file_base64?: string;
  work_type?: string;
  shift_name?: string;
  branch_office: string;
  head_office?: string;
  payroll_period?: string;
  payroll_type?: string;
  account_activation?: string;
  notes?: string;
  role?: string;
}

import { sendEmail } from "@/lib/email-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createTeacherFull(data: CreateTeacherFullInput) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const session = client.startSession();

  const role = data.role || "teacher";
  const defaultPassword = `${role}123`;
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const currentUserSession = await getServerSession(authOptions);
  const currentUserId = currentUserSession?.user?.id || "system";

  // AdminHRD Restriction
  if (currentUserSession?.user?.role === 'adminhrd') {
    if (role === 'hrd') {
      throw new Error("Permission denied: AdminHRD cannot assign HRD role");
    }
  }

  try {
    let result: any = {};
    
    await session.withTransaction(async () => {
      const userResult = await db.collection("users").insertOne({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: role,
        phone_number: data.phone_number || "",
        is_active: data.account_activation === "Ya",
        profile_picture: data.photo_base64 || "",
        created_at: new Date(),
        updated_at: new Date(),
      }, { session });

      const teacherDoc: any = {
        user_id: userResult.insertedId,
        nip: data.nip,
        title_prefix: data.title_prefix || "",
        title_suffix: data.title_suffix || "",
        nik: data.nik || "",
        npwp: data.npwp || "",
        email: data.email,
        address: data.address || "",
        city: data.city || "",
        birth_date: data.birth_date || "",
        gender: data.gender || "",
        education: data.education || "",
        start_work_date: data.start_work_date || "",
        status_teacher: data.status_teacher || "",
        active_status: data.active_status,
        position: data.position,
        grade: data.grade || "",
        department: data.department,
        supervisor_user_id: data.supervisor_user_id && data.supervisor_user_id !== 'none' ? new ObjectId(data.supervisor_user_id) : null,
        bank_name: data.bank_name || "",
        bank_account_number: data.bank_account_number || "",
        bank_account_name: data.bank_account_name || "",
        retirement_date: data.retirement_date || "",
        photo_base64: data.photo_base64 || "",
        kk_file_base64: data.kk_file_base64 || "",
        identity_file_base64: data.identity_file_base64 || "",
        work_type: data.work_type || "",
        shift_name: data.shift_name || "",
        branch_office: data.branch_office,
        head_office: data.head_office || "",
        payroll_period: data.payroll_period || "",
        payroll_type: data.payroll_type || "",
        notes: data.notes || "",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const teacherResult = await db.collection("teachers").insertOne(teacherDoc, { session });

      // Audit Log
      await db.collection("audit_logs").insertOne({
        action: "CREATE",
        collection: "teachers",
        document_id: teacherResult.insertedId,
        user_id: currentUserId,
        changes: data,
        timestamp: new Date()
      }, { session });

      result = {
        success: true,
        teacher_id: teacherResult.insertedId.toString(),
        user_id: userResult.insertedId.toString(),
      };
    });

    // Send Welcome Email (outside transaction to avoid rollback on email failure, or keep inside if critical)
    // Keeping it outside as email failure shouldn't rollback DB creation usually, but user might want it.
    // However, user asked for "Semua operasi database menggunakan transaction". Email is not DB.
    
    const emailSubject = "Selamat Datang di Sistem Manajemen SDM Pesantren Ibnu Syam";
    const emailText = `Assalamualaikum warahmatullahi wabarakatuh,

Segala puji bagi Allah, semoga Bapak/Ibu senantiasa dalam lindungan-Nya.

Melalui email ini kami informasikan bahwa akun Anda telah berhasil terdaftar di Sistem Manajemen SDM Pesantren Ibnu Syam. Untuk mengaktifkan akun dan mulai menggunakan aplikasi, mohon lakukan langkah berikut:

1. Login pertama menggunakan informasi awal berikut:
• Email: "${data.email}"
• Password Default: "${defaultPassword}"
2. Setelah berhasil login, segera lakukan pembaruan profil agar data kepegawaian Anda tercatat lengkap dan akurat.
3. Demi keamanan, kami menghimbau Anda untuk segera mengganti password default dengan password baru yang lebih kuat dan hanya Anda yang mengetahui.

Apabila terdapat kendala teknis, silakan menghubungi Tim HRD & ITC melalui layanan bantuan yang tersedia.

Terima kasih atas kerja samanya.
Wassalamualaikum warahmatullahi wabarakatuh.

Hormat kami,

Ahmad Ilham Syaifulloh, S.Sos
Direktur Operasional & HRD
Pesantren Ibnu Syam`;

    try {
      await sendEmail({
        to: data.email,
        cc: "mainlama01@gmail.com",
        subject: emailSubject,
        text: emailText,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Not failing the request, just logging
    }

    return result;

  } catch (error: any) {
    // Handle duplicate key error for unique HRD role
    if (error.code === 11000 && (error.keyPattern?.role || error.message?.includes('role') || error.message?.includes('unique_hrd_role'))) {
      throw new Error("Constraint violation: Another user already has the HRD role. Only one HRD user is allowed.");
    }
    console.error("Transaction aborted:", error);
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getManagerOptions() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const managers = await db.collection("teachers").aggregate([
    { $match: { position: { $regex: "Manajer", $options: "i" } } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        user_id: { $toString: "$user._id" },
        name: "$user.name",
      },
    },
    { $sort: { name: 1 } },
  ]).toArray();

  return managers as { user_id: string; name: string }[];
}

export async function getJobPositionsOptions() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const col = db.collection("job_positions");
  const defaults = [
    "Pimpinan","Penasihat","Direktur Operasional","Direktur Pendidikan","Manajer Kepengasuhan","Manajer Tahfizh","Manajer Keuangan & Bisnis","Manajer Sekolah Menengah & Litbang","Manajer Sekolah Dasar","Manajer Sekretariat","Manajer Aset, Kerumahtanggaan & Infrastruktur","SPV Kedisiplinan, Kerapihan & Kesehatan","SPV Akhlak & Ibadah","SPV Tahfizh","SPV Kurikulum & Kedisiplinan","SPV Bahasa & Pengajaran","SPV BASAM","SPV CRM","SPV Media","SPV Keuangan","SPV PISMART","SPV Laundry","SPV Aset & Infrastruktur","SPV Kerumahtanggaan","Staff Tahfizh","Staff Kepengasuhan","Staff Bahasa & Pengajaran","Security","Office Boy","Staff HRD","Staff Dapur","Staff PISMART","Staff Keuangan"
  ];
  const count = await col.countDocuments();
  // Ensure all defaults exist
  for (const name of defaults) {
    await col.updateOne(
      { name },
      { $setOnInsert: { name } },
      { upsert: true }
    );
  }
  const rows = await col.find({}).sort({ name: 1 }).toArray();
  return rows.map((r: any) => r.name as string);
}

export async function getDepartmentsOptions() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const col = db.collection("departments");
  const defaults = [
    "Direksi",
    "Departemen Kepengasuhan",
    "Departemen Tahfizh",
    "Departemen Keuangan & Bisnis",
    "Departemen Sekolah Menengah & Litbang",
    "Departemen Sekolah Dasar",
    "Departemen Sekretariat",
    "Departemen Aset, Kerumahtanggaan & Infrastruktur",
  ];
  const count = await col.countDocuments();
  // Ensure all defaults exist
  for (const name of defaults) {
    await col.updateOne(
      { name },
      { $setOnInsert: { name } },
      { upsert: true }
    );
  }
  const rows = await col.find({}).sort({ name: 1 }).toArray();
  return rows.map((r: any) => r.name as string);
}

export async function getBranchOfficesOptions() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const col = db.collection("branch_offices");
  const defaults = [
    "Pesantren Ibnu Syam 1",
    "Pesantren Ibnu Syam 2 Putra",
    "Pesantren Ibnu Syam 2 Putri",
    "Pesantren Ibnu Syam 5",
  ];
  const count = await col.countDocuments();
  if (count === 0) {
    await col.insertMany(defaults.map((name) => ({ name })));
  }
  const rows = await col.find({}).sort({ name: 1 }).toArray();
  return rows.map((r: any) => r.name as string);
}

export async function getPayrollTypesOptions() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const col = db.collection("payroll_types");
  const defaults = [
    "Diatur Sendiri",
    "Sesuai Jabatan/Grade",
  ];
  const count = await col.countDocuments();
  if (count === 0) {
    await col.insertMany(defaults.map((name) => ({ name })));
  }
  const rows = await col.find({}).sort({ name: 1 }).toArray();
  return rows.map((r: any) => r.name as string);
}

export async function normalizeTeacherPayrollTypes() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("teachers").updateMany(
    { payroll_type: { $in: ["Sesuai Jabatan", "Grade"] } },
    { $set: { payroll_type: "Sesuai Jabatan/Grade" } }
  );
}

export async function getTeacherFullById(id: string) {
  noStore();
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const rows = await db.collection("teachers").aggregate([
    { $match: { _id: new ObjectId(id) } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "users",
        localField: "supervisor_user_id",
        foreignField: "_id",
        as: "supervisor",
      },
    },
    {
      $unwind: {
        path: "$supervisor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        nip: 1,
        title_prefix: 1,
        title_suffix: 1,
        nik: 1,
        npwp: 1,
        email: "$user.email",
        address: 1,
        city: 1,
        birth_date: 1,
        phone_number: "$user.phone_number",
        gender: 1,
        education: 1,
        start_work_date: 1,
        status_teacher: 1,
        active_status: 1,
        position: 1,
        grade: 1,
        department: 1,
        supervisor_user_id: { $toString: "$supervisor_user_id" },
        supervisor_name: "$supervisor.name",
        bank_name: 1,
        bank_account_number: 1,
        bank_account_name: 1,
        retirement_date: 1,
        photo_base64: 1,
        kk_file_base64: 1,
        identity_file_base64: 1,
        work_type: 1,
        shift_name: 1,
        branch_office: 1,
        head_office: 1,
        payroll_period: 1,
        payroll_type: 1,
        account_activation: { $cond: [{ $ifNull: ["$user.is_active", false] }, "Ya", "Tidak"] },
        notes: 1,
        user_name: "$user.name",
        user_id: { $toString: "$user._id" },
        role: "$user.role",
      },
    },
  ]).toArray();

  return rows[0] || null;
}

export async function updateTeacherFull(id: string, data: CreateTeacherFullInput & { user_id: string }) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const session = client.startSession();
  const currentUserSession = await getServerSession(authOptions);
  const currentUserId = currentUserSession?.user?.id || "system";

  // AdminHRD Restriction
  if (currentUserSession?.user?.role === 'adminhrd') {
    if (data.role === 'hrd') {
      throw new Error("Permission denied: AdminHRD cannot assign HRD role");
    }
  }

  try {
    await session.withTransaction(async () => {
      const userUpdate: any = {
        name: data.name,
        email: data.email,
        phone_number: data.phone_number || "",
        is_active: data.account_activation === "Ya",
        updated_at: new Date(),
      };

      if (data.role) {
        userUpdate.role = data.role;
      }

      if (data.photo_base64) {
        userUpdate.profile_picture = data.photo_base64;
      }

      await db.collection("users").updateOne(
        { _id: new ObjectId(data.user_id) },
        { $set: userUpdate },
        { session }
      );

      await db.collection("teachers").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            nip: data.nip,
            title_prefix: data.title_prefix || "",
            title_suffix: data.title_suffix || "",
            nik: data.nik || "",
            npwp: data.npwp || "",
            address: data.address || "",
            city: data.city || "",
            birth_date: data.birth_date || "",
            gender: data.gender || "",
            education: data.education || "",
            start_work_date: data.start_work_date || "",
            status_teacher: data.status_teacher || "",
            active_status: data.active_status,
            position: data.position,
            grade: data.grade || "",
            department: data.department,
            supervisor_user_id: data.supervisor_user_id && data.supervisor_user_id !== 'none' ? new ObjectId(data.supervisor_user_id) : null,
            bank_name: data.bank_name || "",
            bank_account_number: data.bank_account_number || "",
            bank_account_name: data.bank_account_name || "",
            retirement_date: data.retirement_date || "",
            photo_base64: data.photo_base64 || "",
            kk_file_base64: data.kk_file_base64 || "",
            identity_file_base64: data.identity_file_base64 || "",
            work_type: data.work_type || "",
            shift_name: data.shift_name || "",
            branch_office: data.branch_office,
            head_office: data.head_office || "",
            payroll_period: data.payroll_period || "",
            payroll_type: data.payroll_type || "",
            notes: data.notes || "",
            updated_at: new Date(),
          },
        },
        { session }
      );

      // Audit Log
      await db.collection("audit_logs").insertOne({
        action: "UPDATE",
        collection: "teachers",
        document_id: new ObjectId(id),
        user_id: currentUserId,
        changes: data,
        timestamp: new Date()
      }, { session });
    });

    revalidatePath(`/hrd/teachers/${id}`);
    return { success: true };
  } catch (error: any) {
    // Handle duplicate key error for unique HRD role
    if (error.code === 11000 && (error.keyPattern?.role || error.message?.includes('role') || error.message?.includes('unique_hrd_role'))) {
      throw new Error("Constraint violation: Another user already has the HRD role. Only one HRD user is allowed.");
    }
    console.error("Transaction aborted:", error);
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function bulkImportTeachersExcel(rows: CreateTeacherFullInput[]) {
  let inserted = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await createTeacherFull(row);
      inserted += 1;
    } catch (e) {
      failed += 1;
    }
  }

  return {
    success: true,
    inserted,
    failed,
  };
}
