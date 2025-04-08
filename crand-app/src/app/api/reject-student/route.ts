import { NextRequest, NextResponse } from "next/server";
import { rejectStudent } from "@/app/admin/prospective_students/action";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body.id;

  const result = await rejectStudent(id);
  return NextResponse.json(result);
}
