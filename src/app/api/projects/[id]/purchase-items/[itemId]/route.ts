import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-utils";
import { deletePurchaseItem, updatePurchaseItem } from "@/lib/services/projectService";
import { purchaseItemInputSchema } from "@/lib/validation/project";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[id]/purchase-items/[itemId]">,
) {
  try {
    const { id, itemId } = await ctx.params;
    const body = await request.json();
    const input = purchaseItemInputSchema.parse(body);
    const item = await updatePurchaseItem(id, itemId, input);
    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/projects/[id]/purchase-items/[itemId]">,
) {
  try {
    const { id, itemId } = await ctx.params;
    await deletePurchaseItem(id, itemId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
