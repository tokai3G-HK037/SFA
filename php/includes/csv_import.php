<?php
// 仕入明細CSV取り込み (Next.js版 src/lib/services/purchaseItemCsv.ts の移植)

require_once __DIR__ . '/validation.php';

const PURCHASE_ITEM_CSV_HEADERS = ['仕入先', '品目', '数量', '単位', '単価', '備考'];

/**
 * CSVファイルの内容(生バイト列)をパースする。
 * ヘッダー行(仕入先,品目,数量,単位,単価,備考)を必須とし、列名でマッピングする(列順は問わない)。
 * @return array{rows: array, errors: array} rows=登録可能な明細の配列, errors=[['row'=>行番号,'message'=>内容], ...]
 */
function parse_purchase_items_csv(string $rawContent, string $encoding): array
{
    if ($encoding === 'shift_jis') {
        $text = mb_convert_encoding($rawContent, 'UTF-8', 'SJIS-win');
    } else {
        $text = $rawContent;
    }
    // UTF-8 BOM除去
    $text = preg_replace('/^\xEF\xBB\xBF/', '', $text);
    $text = str_replace("\r\n", "\n", $text);
    $text = str_replace("\r", "\n", $text);
    $lines = explode("\n", $text);
    $lines = array_values(array_filter($lines, function ($l) { return trim($l) !== ''; }));

    if (empty($lines)) {
        return ['rows' => [], 'errors' => [['row' => 0, 'message' => 'CSVにデータがありません']]];
    }

    $header = str_getcsv(array_shift($lines));
    $header = array_map('trim', $header);
    $colIndex = [];
    foreach (PURCHASE_ITEM_CSV_HEADERS as $col) {
        $idx = array_search($col, $header, true);
        $colIndex[$col] = $idx === false ? null : $idx;
    }
    foreach (['仕入先', '品目', '数量', '単価'] as $required) {
        if ($colIndex[$required] === null) {
            return ['rows' => [], 'errors' => [['row' => 1, 'message' => "ヘッダーに「{$required}」列が見つかりません"]]];
        }
    }

    $rows = [];
    $errors = [];
    foreach ($lines as $i => $line) {
        $rowNumber = $i + 2; // 1行目はヘッダーなのでデータは2行目から
        $fields = str_getcsv($line);
        $get = function ($col) use ($fields, $colIndex) {
            $idx = $colIndex[$col];
            return $idx !== null && isset($fields[$idx]) ? trim($fields[$idx]) : '';
        };

        [$data, $rowErrors] = validate_purchase_item([
            'supplier_name' => $get('仕入先'),
            'item_name' => $get('品目'),
            'quantity' => $get('数量'),
            'unit' => $get('単位'),
            'unit_price' => $get('単価'),
            'notes' => $get('備考'),
        ]);

        if (!empty($rowErrors)) {
            $errors[] = ['row' => $rowNumber, 'message' => implode(' / ', $rowErrors)];
            continue;
        }
        $rows[] = $data;
    }

    return ['rows' => $rows, 'errors' => $errors];
}
