import { NextResponse, type NextRequest } from "next/server";
import { handleApiError, jsonError } from "@/lib/api-utils";
import {
  deleteEstimate,
  getEstimateById,
  updateEstimate,
} from "@/lib/services/estimateService";
import { estimateInputSchema } from "@/lib/validation/estimate";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/estimates/[id]">) {
  try {
    const { id } = await ctx.params;
    const estimate = await getEstimateById(id);
    if (!estimate) return jsonError("見積書が見つかりません", 404);
    return NextResponse.json(estimate);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/estimates/[id]">) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const input = estimateInputSchema.parse(body);
    const estimate = await updateEstimate(id, input);
    return NextResponse.json(estimate);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/estimates/[id]">) {
  try {
    const { id } = await ctx.params;
    await deleteEstimate(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
