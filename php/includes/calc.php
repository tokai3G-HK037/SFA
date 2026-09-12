<?php
// 見積金額計算・見積番号採番ロジック
// (Next.js版 src/lib/estimate-calc.ts / src/lib/services/estimateNumbering.ts の移植)

require_once __DIR__ . '/db.php';

/**
 * 明細から小計・消費税・合計を計算する。
 * - 外税(EXCLUSIVE): 明細合計(税抜)を小計とし、税額を加算して合計とする
 * - 内税(INCLUSIVE): 明細合計(税込)を合計とし、そこから税額を逆算して小計とする
 * 金額はすべて円単位の整数に丸める。
 *
 * @param array $items [['quantity' => float, 'unit_price' => float], ...]
 */
function calculate_estimate_amounts(array $items, float $taxRate, string $taxType): array
{
    $itemsTotal = 0;
    foreach ($items as $item) {
        $quantity = isset($item['quantity']) ? (float)$item['quantity'] : 0.0;
        $unitPrice = isset($item['unit_price']) ? (float)$item['unit_price'] : 0.0;
        $itemsTotal += (int)round($quantity * $unitPrice);
    }

    if ($taxType === 'INCLUSIVE') {
        $totalAmount = $itemsTotal;
        $taxAmount = (int)round($totalAmount - $totalAmount / (1 + $taxRate / 100));
        $subtotal = $totalAmount - $taxAmount;
        return ['subtotal' => $subtotal, 'tax_amount' => $taxAmount, 'total_amount' => $totalAmount];
    }

    $subtotal = $itemsTotal;
    $taxAmount = (int)round($subtotal * ($taxRate / 100));
    $totalAmount = $subtotal + $taxAmount;
    return ['subtotal' => $subtotal, 'tax_amount' => $taxAmount, 'total_amount' => $totalAmount];
}

/**
 * 見積番号を発行する。フォーマット: Q-{発行年}-{4桁連番}(例: Q-2026-0001)
 * 連番は発行年ごとにリセットされる。同一年内の既存件数+1から空きを探索する。
 */
function generate_estimate_number(string $issueDate): string
{
    $year = substr($issueDate, 0, 4);
    $prefix = "Q-{$year}-";

    $stmt = db()->prepare('SELECT COUNT(*) FROM estimates WHERE estimate_number LIKE ?');
    $stmt->execute([$prefix . '%']);
    $count = (int)$stmt->fetchColumn();

    for ($offset = 0; $offset < 10; $offset++) {
        $candidate = $prefix . str_pad((string)($count + 1 + $offset), 4, '0', STR_PAD_LEFT);
        $check = db()->prepare('SELECT id FROM estimates WHERE estimate_number = ?');
        $check->execute([$candidate]);
        if (!$check->fetch()) {
            return $candidate;
        }
    }

    throw new RuntimeException('見積番号の採番に失敗しました。時間をおいて再度お試しください。');
}
