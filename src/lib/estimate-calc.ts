// 見積金額計算(サーバー・クライアント共通で使う純粋関数。DB等への依存を持たない)

export type EstimateAmountItem = {
  quantity: number;
  unitPrice: number;
};

/**
 * 明細から小計・消費税・合計を計算する。
 * - 外税(EXCLUSIVE): 明細合計(税抜)を小計とし、税額を加算して合計とする
 * - 内税(INCLUSIVE): 明細合計(税込)を合計とし、そこから税額を逆算して小計とする
 * 金額はすべて円単位の整数に丸める。
 */
export function calculateEstimateAmounts(
  items: EstimateAmountItem[],
  taxRate: number,
  taxType: "EXCLUSIVE" | "INCLUSIVE",
) {
  const itemsTotal = items.reduce(
    (sum, item) => sum + Math.round((item.quantity || 0) * (item.unitPrice || 0)),
    0,
  );

  if (taxType === "INCLUSIVE") {
    const totalAmount = itemsTotal;
    const taxAmount = Math.round(totalAmount - totalAmount / (1 + taxRate / 100));
    const subtotal = totalAmount - taxAmount;
    return { subtotal, taxAmount, totalAmount };
  }

  const subtotal = itemsTotal;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const totalAmount = subtotal + taxAmount;
  return { subtotal, taxAmount, totalAmount };
}
