import { NextRequest, NextResponse } from "next/server";
import { acceptStudent } from "@/app/admin/prospective_students/action";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body.id;

  const result = await acceptStudent(id);
  return NextResponse.json(result);
}
