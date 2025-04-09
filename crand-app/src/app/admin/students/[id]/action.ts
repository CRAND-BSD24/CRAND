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
  phone_number: string;
  class_name: string;
  halaqah_id?: string | null;
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
          user_id: 1,
          class_id: 1,
          halaqah_id: 1,
          email: "$user.email",
          phone_number: "$user.phone_number",
          profile_picture: {
            $ifNull: [
              "$user.profile_picture",
              "https://static.vecteezy.com/system/resources/thumbnails/021/548/095/small_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg",
            ],
          },
          class_name: "$class.class_name",
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

    // Get class data separately to ensure we have the correct class information
    const classData = await db.collection("classes").findOne(
      { _id: new ObjectId(s.class_id) },
      { projection: { class_name: 1 } }
    );

    return {
      ...s,
      _id: s._id.toString(),
      user_id: s.user_id?.toString() || null,
      class_id: s.class_id?.toString() || null,
      halaqah_id: s.halaqah_id?.toString() || null,
      created_at: s.created_at?.toISOString(),
      updated_at: s.updated_at?.toISOString(),
      email: s.email || "-",
      phone_number: s.phone_number || "-",
      profile_picture: s.profile_picture,
      class_name: classData?.class_name || s.class_name || "-", // Use class_name from separate query or fallback to lookup result
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

/* // Commenting out unused interface
interface UserUpdate {
  $set: {
    phone_number?: string;
    email?: string;
    updated_at: Date;
  };
}
*/

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

// Define type for the student $set operation
interface StudentSetUpdate {
  name: string;
  academic_level: string;
  gender: string;
  father_name: string;
  mother_name: string;
  academic_year: string;
  birth_place_date: string;
  address: string;
  graduation_status: string;
  VA_SPP: string;
  ekskul: string;
  level: string;
  nisn: string;
  program: string;
  profile_picture: string;
  updated_at: Date;
  class_id?: ObjectId | null;
  halaqah_id?: ObjectId | null;
}

// Define type for the user $set operation
interface UserSetUpdate {
  updated_at: Date;
  phone_number?: string;
  email?: string;
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
    const studentObjectId = new ObjectId(id);

    // Fetch the student document first to get the user_id
    const studentDoc = await db.collection("students").findOne(
      { _id: studentObjectId },
      { projection: { user_id: 1 } }
    );

    // We might need user_id later, even if email/phone aren't changing now
    const userId = studentDoc?.user_id; // userId will be ObjectId | undefined

    // Prepare the student update object
    const updateObj: { $set: Partial<StudentSetUpdate> } = {
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
        VA_SPP: updatedData.VA_SPP,
        ekskul: updatedData.ekskul,
        level: updatedData.level,
        nisn: updatedData.nisn,
        program: updatedData.program,
        profile_picture: updatedData.profile_picture,
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
      { _id: studentObjectId },
      updateObj
    );

    console.log("Student update result:", studentResult);

    let userUpdateSucceeded = false; // Flag to track user update success

    // Update user data (phone number and email) only if userId exists
    if (userId && (updatedData.phone_number || updatedData.email)) {
      console.log("Updating user data for user ID:", userId, { phone: updatedData.phone_number, email: updatedData.email });
      
      const userUpdate: { $set: UserSetUpdate } = {
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
        { _id: userId }, // Use the correct user ID (_id)
        userUpdate
      );
      console.log("User update result:", userResult);
      userUpdateSucceeded = userResult.modifiedCount > 0; // Set the flag based on result
    } else if (updatedData.phone_number || updatedData.email) {
      // Log a warning if we intended to update user but couldn't find user_id
      console.warn(`Student ${id} does not have a linked user_id or user_id is null. Cannot update user email/phone.`);
    }

    // Return true if either the student OR the user update succeeded
    return studentResult.modifiedCount > 0 || userUpdateSucceeded;
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