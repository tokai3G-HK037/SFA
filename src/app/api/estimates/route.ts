import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-utils";
import { createEstimate, listEstimates } from "@/lib/services/estimateService";
import { estimateInputSchema, estimateQuerySchema } from "@/lib/validation/estimate";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = estimateQuerySchema.parse({
      projectId: searchParams.get("projectId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    const estimates = await listEstimates(query);
    return NextResponse.json(estimates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = estimateInputSchema.parse(body);
    const estimate = await createEstimate(input);
    return NextResponse.json(estimate, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
