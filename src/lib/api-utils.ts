import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } as ApiResponse<T>, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message } as ApiResponse, { status });
}

export async function validateBody<T>(request: Request, schema: ZodSchema<T>): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) {
      const message = e.issues.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
      return errorResponse(message, 422);
    }
    return errorResponse("Invalid JSON body", 400);
  }
}
