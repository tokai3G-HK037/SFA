import { NextResponse, type NextRequest } from "next/server";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { bulkImportPurchaseItems } from "@/lib/services/projectService";
import {
  parsePurchaseItemsCsv,
  purchaseItemCsvHeaders,
  type PurchaseItemCsvEncoding,
} from "@/lib/services/purchaseItemCsv";

// テンプレートCSVをダウンロードする
export async function GET() {
  const header = purchaseItemCsvHeaders.join(",");
  const sampleRow = "サンプル仕入株式会社,サンプル品目,10,個,1000,";
  const csv = `${header}\n${sampleRow}\n`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="purchase-items-template.csv"',
    },
  });
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[id]/purchase-items/import">,
) {
  try {
    const { id } = await ctx.params;
    const formData = await request.formData();
    const file = formData.get("file");
    const encodingRaw = formData.get("encoding");
    const encoding: PurchaseItemCsvEncoding = encodingRaw === "shift_jis" ? "shift_jis" : "utf8";

    if (!(file instanceof File)) {
      return jsonError("CSVファイルを選択してください", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { rows, errors } = parsePurchaseItemsCsv(buffer, encoding);

    if (rows.length === 0 && errors.length === 0) {
      return jsonError("CSVにデータ行がありません", 400);
    }
    if (errors.length > 0) {
      return NextResponse.json(
        { error: "CSVの内容に誤りがあります。修正して再度お試しください。", rowErrors: errors },
        { status: 400 },
      );
    }

    await bulkImportPurchaseItems(id, rows);
    return NextResponse.json({ imported: rows.length }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
