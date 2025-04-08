'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

interface Student {
  _id: string;
  class_id: string | null;
  user_id: string | null;
  name: string;
  nisn: string;
  academic_level: string;
  gender: string;
  father_name: string;
  mother_name: string;
  academic_year: string;
  birth_place_date: string;
  address: string;
  email: string;
  graduation_status: string;
  payment_status: string;
  VA_SPP: string;
  ekskul: string;
  level: string;
  program: string;
  halaqah: string;
  profile_picture: string;
  created_at: string;
  updated_at: string;
}


export async function getStudentById(id: string): Promise<Student | null> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $lookup: {
          from: "halaqah",
          localField: "halaqah_id",
          foreignField: "_id",
          as: "halaqah",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$halaqah", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          nisn: 1,
          name: 1,
          academic_level: 1,
          gender: 1,
          father_name: 1,
          mother_name: 1,
          academic_year: 1,
          birth_place_date: 1,
          address: 1,
          graduation_status: 1,
          VA_SPP: 1,
          ekskul: 1,
          level: 1,
          program: 1,
          created_at: 1,
          updated_at: 1,
          phone_number: 1,
          user_id: 1,
          class_id: 1,
          email: "$user.email",
          profile_picture: {
            $ifNull: [
              "$user.profile_picture",
              "https://static.vecteezy.com/system/resources/thumbnails/021/548/095/small_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg",
            ],
          },
          class: "$class.class_name",
          halaqah: "$halaqah.name",
          payment_status: {
            $cond: {
              if: { $ifNull: ["$VA_SPP", false] },
              then: "Aktif",
              else: "Belum Aktif",
            },
          },
        },
      },
    ];

    const student = await db.collection("students").aggregate(pipeline).toArray();

    if (!student || student.length === 0) return null;

    const s = student[0];

    return {
      ...s,
      _id: s._id.toString(),
      user_id: s.user_id?.toString() || null,
      class_id: s.class_id?.toString() || null,
      created_at: s.created_at?.toISOString(),
      updated_at: s.updated_at?.toISOString(),
      email: s.email || "-",
      profile_picture: s.profile_picture,
      halaqah: s.halaqah || "-",
      name: s.name,
      nisn: s.nisn,
      academic_level: s.academic_level,
      gender: s.gender,
      father_name: s.father_name,
      mother_name: s.mother_name,
      academic_year: s.academic_year,
      birth_place_date: s.birth_place_date,
      address: s.address,
      graduation_status: s.graduation_status,
      payment_status: s.payment_status,
      VA_SPP: s.VA_SPP,
      ekskul: s.ekskul,
      level: s.level,
      program: s.program,
    };
  } catch (error) {
    console.error("🔥 Error getStudentById:", error);
    return null;
  }
}

interface UserUpdate {
  $set: {
    phone_number?: string;
    email?: string;
    updated_at: Date;
  };
}

interface StudentUpdate {
  name: string;
  class_id?: string | null;
  academic_level: string;
  gender: string;
  father_name: string;
  mother_name: string;
  academic_year: string;
  birth_place_date: string;
  address: string;
  email: string;
  phone_number: string;
  graduation_status: string;
  payment_status: string;
  VA_SPP: string;
  ekskul: string;
  level: string;
  nisn: string;
  program: string;
  halaqah_id?: string | null;
  profile_picture: string;
}

export const updateStudentById = async (id: string, updatedData: StudentUpdate) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    console.log("Updating student with data:", updatedData);

    // Validate ID format first
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid student ID format");
    }

    // Prepare the update object
    const updateObj: any = {
      $set: {
        name: updatedData.name,
        academic_level: updatedData.academic_level,
        gender: updatedData.gender,
        father_name: updatedData.father_name,
        mother_name: updatedData.mother_name,
        academic_year: updatedData.academic_year,
        birth_place_date: updatedData.birth_place_date,
        address: updatedData.address,
        graduation_status: updatedData.graduation_status,
        payment_status: updatedData.payment_status,
        VA_SPP: updatedData.VA_SPP,
        ekskul: updatedData.ekskul,
        level: updatedData.level,
        nisn: updatedData.nisn,
        program: updatedData.program,
        profile_picture: updatedData.profile_picture,
        phone_number: updatedData.phone_number,
        updated_at: new Date()
      }
    };

    // Only add class_id if it's valid
    if (updatedData.class_id && ObjectId.isValid(updatedData.class_id)) {
      updateObj.$set.class_id = new ObjectId(updatedData.class_id);
    } else {
      updateObj.$set.class_id = null;
    }

    // Only add halaqah_id if it's valid
    if (updatedData.halaqah_id && ObjectId.isValid(updatedData.halaqah_id)) {
      updateObj.$set.halaqah_id = new ObjectId(updatedData.halaqah_id);
    } else {
      updateObj.$set.halaqah_id = null;
    }

    // Update student data
    const studentResult = await db.collection("students").updateOne(
      { _id: new ObjectId(id) },
      updateObj
    );

    console.log("Student update result:", studentResult);

    // Update user data (phone number and email)
    if (updatedData.phone_number || updatedData.email) {
      console.log("Updating user data:", { phone: updatedData.phone_number, email: updatedData.email });
      
      const userUpdate: any = {
        $set: {
          updated_at: new Date()
        }
      };

      if (updatedData.phone_number) {
        userUpdate.$set.phone_number = updatedData.phone_number;
      }
      if (updatedData.email) {
        userUpdate.$set.email = updatedData.email;
      }

      const userResult = await db.collection("users").updateOne(
        { student_id: new ObjectId(id) },
        userUpdate,
        { upsert: true }
      );
      console.log("User update result:", userResult);
    }

    return studentResult.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating student:", error);
    return false;
  }
};

export const deleteStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("students").deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};