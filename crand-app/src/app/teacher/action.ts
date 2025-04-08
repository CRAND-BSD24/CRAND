"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export interface TeacherData {
  _id: string;
  user_id: string;
  name: string;
}

export interface ClassData {
  _id: string;
  class_name: string;
  teacher_id: string;
}

export async function getTeacherData(): Promise<{
  teacher: TeacherData | null;
  classData: ClassData | null;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { teacher: null, classData: null };
  }

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const teacherData = await db.collection("teachers").findOne({
      user_id: new ObjectId(session.user.id),
    });

    if (!teacherData) {
      return { teacher: null, classData: null };
    }
    const userData = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });
    const classData = await db.collection("classes").findOne({
      teacher_id: teacherData._id,
    });
    // console.log(teacherData, "paguru");
    return {
      teacher: {
        _id: teacherData._id.toString(),
        user_id: teacherData.user_id.toString(),
        name: userData?.name || "",
      },
      classData: classData
        ? {
            _id: classData._id.toString(),
            class_name: classData.class_name,
            teacher_id: classData.teacher_id.toString(),
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching teacher data:", error);
    return { teacher: null, classData: null };
  }
}
