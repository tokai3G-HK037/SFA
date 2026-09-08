import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-utils";
import { addPurchaseItem, listPurchaseItems } from "@/lib/services/projectService";
import { purchaseItemInputSchema } from "@/lib/validation/project";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/projects/[id]/purchase-items">,
) {
  try {
    const { id } = await ctx.params;
    const items = await listPurchaseItems(id);
    return NextResponse.json(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[id]/purchase-items">,
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const input = purchaseItemInputSchema.parse(body);
    const item = await addPurchaseItem(id, input);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
