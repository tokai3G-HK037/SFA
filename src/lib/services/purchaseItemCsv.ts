import { parse } from "csv-parse/sync";
import iconv from "iconv-lite";
import { purchaseItemInputSchema, type PurchaseItemInput } from "@/lib/validation/project";

export const purchaseItemCsvHeaders = ["仕入先", "品目", "数量", "単位", "単価", "備考"] as const;

export type PurchaseItemCsvEncoding = "utf8" | "shift_jis";

export type PurchaseItemCsvRowError = {
  row: number; // ヘッダーを1行目として数えた行番号
  message: string;
};

export type ParsePurchaseItemCsvResult = {
  rows: PurchaseItemInput[];
  errors: PurchaseItemCsvRowError[];
};

/**
 * 仕入明細CSVをパースする。ヘッダー行(仕入先,品目,数量,単位,単価,備考)を必須とし、
 * 列名で値をマッピングする(列順は問わない)。単位・備考は任意。
 * 数量は値引き行に対応するためマイナスも許容する。
 */
export function parsePurchaseItemsCsv(
  fileBuffer: Buffer,
  encoding: PurchaseItemCsvEncoding,
): ParsePurchaseItemCsvResult {
  const text = encoding === "shift_jis" ? iconv.decode(fileBuffer, "Shift_JIS") : fileBuffer.toString("utf-8");
  const normalized = text.replace(/^﻿/, ""); // UTF-8 BOM除去

  let records: Record<string, string>[];
  try {
    records = parse(normalized, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (error) {
    return {
      rows: [],
      errors: [{ row: 0, message: `CSVの解析に失敗しました: ${(error as Error).message}` }],
    };
  }

  const rows: PurchaseItemInput[] = [];
  const errors: PurchaseItemCsvRowError[] = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2; // 1行目はヘッダーなのでデータは2行目から
    const parsed = purchaseItemInputSchema.safeParse({
      supplierName: record["仕入先"],
      itemName: record["品目"],
      quantity: record["数量"],
      unit: record["単位"] ?? "",
      unitPrice: record["単価"],
      notes: record["備考"] ?? "",
    });

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(" / ");
      errors.push({ row: rowNumber, message: message || "入力内容に誤りがあります" });
      return;
    }
    rows.push(parsed.data);
  });

  return { rows, errors };
}
