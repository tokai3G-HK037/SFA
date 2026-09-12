<?php
// 入力バリデーション(Next.js版 src/lib/validation/*.ts の移植)

function validate_project(array $post): array
{
    $errors = [];
    $data = [];

    $data['customer_name'] = trim($post['customer_name'] ?? '');
    if ($data['customer_name'] === '') {
        $errors['customer_name'] = '顧客名を入力してください';
    }

    $data['project_name'] = trim($post['project_name'] ?? '');
    if ($data['project_name'] === '') {
        $errors['project_name'] = '案件名を入力してください';
    }

    $data['assignee'] = trim($post['assignee'] ?? '') ?: null;

    $status = trim($post['status'] ?? '');
    $data['status'] = in_array($status, PROJECT_STATUS_VALUES, true) ? $status : 'ESTIMATING';

    $amountRaw = trim($post['amount'] ?? '0');
    if (!is_numeric($amountRaw) || (float)$amountRaw < 0) {
        $errors['amount'] = '0以上を入力してください';
        $data['amount'] = 0;
    } else {
        $data['amount'] = (float)$amountRaw;
    }

    $data['expected_delivery_date'] = trim($post['expected_delivery_date'] ?? '') ?: null;
    $data['notes'] = trim($post['notes'] ?? '') ?: null;

    $data['end_user_name'] = trim($post['end_user_name'] ?? '') ?: null;
    $data['end_user_contact_person'] = trim($post['end_user_contact_person'] ?? '') ?: null;
    $data['end_user_address'] = trim($post['end_user_address'] ?? '') ?: null;
    $data['end_user_contact'] = trim($post['end_user_contact'] ?? '') ?: null;

    return [$data, $errors];
}

/** 数量はマイナス可(値引き行対応)、単価は0以上 */
function validate_purchase_item(array $post): array
{
    $errors = [];
    $data = [];

    $data['supplier_name'] = trim($post['supplier_name'] ?? '');
    if ($data['supplier_name'] === '') {
        $errors['supplier_name'] = '仕入先を入力してください';
    }

    $data['item_name'] = trim($post['item_name'] ?? '');
    if ($data['item_name'] === '') {
        $errors['item_name'] = '品目を入力してください';
    }

    $qtyRaw = trim($post['quantity'] ?? '');
    if ($qtyRaw === '' || !is_numeric($qtyRaw)) {
        $errors['quantity'] = '数量を入力してください';
        $data['quantity'] = 0;
    } else {
        $data['quantity'] = (float)$qtyRaw;
    }

    $data['unit'] = trim($post['unit'] ?? '') ?: null;

    $priceRaw = trim($post['unit_price'] ?? '');
    if ($priceRaw === '' || !is_numeric($priceRaw) || (float)$priceRaw < 0) {
        $errors['unit_price'] = '0以上を入力してください';
        $data['unit_price'] = 0;
    } else {
        $data['unit_price'] = (float)$priceRaw;
    }

    $data['notes'] = trim($post['notes'] ?? '') ?: null;

    return [$data, $errors];
}

/**
 * 見積書フォーム全体のバリデーション。
 * $post['items'] は [['name'=>..,'quantity'=>..,'unit'=>..,'unit_price'=>..,'notes'=>..], ...] を想定
 */
function validate_estimate(array $post): array
{
    $errors = [];
    $data = [];

    $data['project_id'] = trim($post['project_id'] ?? '');
    if ($data['project_id'] === '') {
        $errors['project_id'] = '案件を選択してください';
    }

    $data['title'] = trim($post['title'] ?? '');
    if ($data['title'] === '') {
        $errors['title'] = '件名を入力してください';
    }

    $data['addressee'] = trim($post['addressee'] ?? '');
    if ($data['addressee'] === '') {
        $errors['addressee'] = '宛先を入力してください';
    }

    $data['issuer_name'] = trim($post['issuer_name'] ?? '');
    if ($data['issuer_name'] === '') {
        $errors['issuer_name'] = '発行者名を入力してください';
    }
    $data['issuer_address'] = trim($post['issuer_address'] ?? '') ?: null;
    $data['issuer_contact'] = trim($post['issuer_contact'] ?? '') ?: null;

    $data['issue_date'] = trim($post['issue_date'] ?? '');
    if ($data['issue_date'] === '') {
        $errors['issue_date'] = '発行日を入力してください';
    }
    $data['valid_until'] = trim($post['valid_until'] ?? '') ?: null;

    $taxRateRaw = trim($post['tax_rate'] ?? '10');
    $data['tax_rate'] = is_numeric($taxRateRaw) ? (float)$taxRateRaw : 10.0;

    $taxType = trim($post['tax_type'] ?? '');
    $data['tax_type'] = in_array($taxType, TAX_TYPE_VALUES, true) ? $taxType : 'EXCLUSIVE';

    $status = trim($post['status'] ?? '');
    $data['status'] = in_array($status, ESTIMATE_STATUS_VALUES, true) ? $status : 'DRAFT';

    $data['notes'] = trim($post['notes'] ?? '') ?: null;

    $items = [];
    $rawItems = $post['items'] ?? [];
    foreach ($rawItems as $rawItem) {
        $name = trim($rawItem['name'] ?? '');
        if ($name === '') {
            continue; // 品名未入力の行は無視する
        }
        $qtyRaw = trim($rawItem['quantity'] ?? '');
        $priceRaw = trim($rawItem['unit_price'] ?? '');
        $items[] = [
            'name' => $name,
            'quantity' => is_numeric($qtyRaw) ? (float)$qtyRaw : 0,
            'unit' => trim($rawItem['unit'] ?? '') ?: null,
            'unit_price' => is_numeric($priceRaw) ? (float)$priceRaw : 0,
            'notes' => trim($rawItem['notes'] ?? '') ?: null,
        ];
    }
    if (empty($items)) {
        $errors['items'] = '明細を1件以上入力してください';
    }
    $data['items'] = $items;

    return [$data, $errors];
}
