'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export const getStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const student = await db.collection("students").findOne({ _id: new ObjectId(id) });
    console.log("Student data:", student);

    if (!student) return null;

    // Get class data
    const classData = student.class_id 
      ? await db.collection("classes").findOne({ _id: new ObjectId(student.class_id) })
      : null;
    console.log("Class data:", classData);

    // Get user data for phone number and email
    const userData = await db.collection("users").findOne({ student_id: new ObjectId(id) });
    console.log("User data:", userData);

    // Get prospective student data for phone number, email, and academic_year
    const prospectiveData = await db.collection("prospective_students").findOne({ 
      $or: [
        { student_id: new ObjectId(id) },
        { name: student.name },
        { email: student.email }
      ]
    });
    console.log("Prospective student data:", prospectiveData);

    // Get phone number with priority: users -> prospective_students
    let phoneNumber = "-";
    if (userData?.phone_number) {
      phoneNumber = userData.phone_number;
    } else if (prospectiveData?.phone_number) {
      phoneNumber = prospectiveData.phone_number;
      
      // If found in prospective_students, update users table
      if (prospectiveData.phone_number !== "-") {
        await db.collection("users").updateOne(
          { student_id: new ObjectId(id) },
          {
            $set: {
              phone_number: prospectiveData.phone_number,
              updated_at: new Date()
            }
          },
          { upsert: true }
        );
      }
    }

    // Get email with priority: users -> prospective_students
    let email = "-";
    if (userData?.email) {
      email = userData.email;
    } else if (prospectiveData?.email) {
      email = prospectiveData.email;
    }

    // Get academic year from prospective_students
    const academicYear = prospectiveData?.academic_year || "-";

    const result = {
      _id: student._id.toString(),
      name: student.name || "-",
      class: classData ? classData.class_name : "-",
      class_id: student.class_id?.toString() || null,
      academic_level: student.academic_level || "-",
      gender: student.gender || "-",
      parent_name: student.parent_name || "-",
      batch_year: academicYear, // Use academic_year from prospective_students
      birth_place: student.birth_place || "-",
      birth_date: student.birth_date ? new Date(student.birth_date).toISOString().split('T')[0] : "-",
      address: student.address || "-",
      email: email,
      phone_number: phoneNumber,
      graduation_status: student.graduation_status || "Aktif",
      payment_status: student.payment_status || "-",
      profile_picture: student.profile_picture || "/default-profile.png",
      created_at: student.created_at || new Date(),
      updated_at: student.updated_at || new Date(),
    };

    console.log("Final result:", result);
    return JSON.stringify(result);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    return null;
  }
};

interface UserUpdate {
  $set: {
    phone_number?: string;
    email?: string;
    updated_at: Date;
  };
}

interface ProspectiveUpdate {
  $set: {
    student_id: ObjectId;
    phone_number?: string;
    email?: string;
    academic_year?: string;
    updated_at: Date;
  };
}

export const updateStudentById = async (id: string, updatedData: any) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    console.log("Updating student with data:", updatedData);

    // Update student data
    const studentResult = await db.collection("students").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: updatedData.name,
          class_id: updatedData.class_id ? new ObjectId(updatedData.class_id) : null,
          academic_level: updatedData.academic_level,
          gender: updatedData.gender,
          parent_name: updatedData.parent_name,
          birth_date: updatedData.birth_date,
          birth_place: updatedData.birth_place,
          address: updatedData.address,
          graduation_status: updatedData.graduation_status,
          payment_status: updatedData.payment_status,
          profile_picture: updatedData.profile_picture,
          updated_at: new Date()
        }
      }
    );

    console.log("Student update result:", studentResult);

    // Update user data (phone number and email)
    if (updatedData.phone_number || updatedData.email) {
      console.log("Updating user data:", { phone: updatedData.phone_number, email: updatedData.email });
      
      const userUpdate: UserUpdate = {
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

    // Update prospective_students data
    if (updatedData.phone_number || updatedData.email || updatedData.batch_year) {
      console.log("Updating prospective student data:", {
        phone: updatedData.phone_number,
        email: updatedData.email,
        academic_year: updatedData.batch_year
      });

      const prospectiveUpdate: ProspectiveUpdate = {
        $set: {
          student_id: new ObjectId(id),
          updated_at: new Date()
        }
      };

      if (updatedData.phone_number) {
        prospectiveUpdate.$set.phone_number = updatedData.phone_number;
      }
      if (updatedData.email) {
        prospectiveUpdate.$set.email = updatedData.email;
      }
      if (updatedData.batch_year) {
        prospectiveUpdate.$set.academic_year = updatedData.batch_year;
      }

      const prospectiveResult = await db.collection("prospective_students").updateOne(
        { 
          $or: [
            { student_id: new ObjectId(id) },
            { name: updatedData.name }
          ]
        },
        prospectiveUpdate,
        { upsert: true }
      );
      console.log("Prospective student update result:", prospectiveResult);
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