import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "入力内容に誤りがあります", issues: error.issues },
      { status: 400 },
    );
  }
  console.error(error);
  return jsonError("サーバーエラーが発生しました", 500);
}
