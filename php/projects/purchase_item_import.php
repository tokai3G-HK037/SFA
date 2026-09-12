<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/csv_import.php';

$projectId = get_str('project_id');
$stmt = db()->prepare('SELECT id, customer_name, project_name FROM projects WHERE id = ? AND is_deleted = 0');
$stmt->execute([$projectId]);
$project = $stmt->fetch();
if (!$project) {
    http_response_code(404);
    die('案件が見つかりません');
}

// テンプレートCSVダウンロード
if (isset($_GET['template'])) {
    $header = implode(',', PURCHASE_ITEM_CSV_HEADERS);
    $sample = 'サンプル仕入株式会社,サンプル品目,10,個,1000,';
    $csv = $header . "\n" . $sample . "\n";
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="purchase-items-template.csv"');
    echo "\xEF\xBB\xBF" . $csv; // Excelでの文字化け防止にBOM付与
    exit;
}

$rowErrors = [];
$generalError = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $encoding = ($_POST['encoding'] ?? '') === 'shift_jis' ? 'shift_jis' : 'utf8';

    if (empty($_FILES['file']['tmp_name']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $generalError = 'CSVファイルを選択してください';
    } else {
        $content = file_get_contents($_FILES['file']['tmp_name']);
        $result = parse_purchase_items_csv($content, $encoding);

        if (!empty($result['errors'])) {
            $rowErrors = $result['errors'];
            $generalError = 'CSVの内容に誤りがあります。修正して再度お試しください。';
        } elseif (empty($result['rows'])) {
            $generalError = 'CSVにデータ行がありません';
        } else {
            $maxOrderStmt = db()->prepare('SELECT COALESCE(MAX(sort_order), -1) FROM purchase_items WHERE project_id = ?');
            $maxOrderStmt->execute([$projectId]);
            $nextOrder = (int)$maxOrderStmt->fetchColumn() + 1;

            $insert = db()->prepare(
                'INSERT INTO purchase_items (id, project_id, sort_order, supplier_name, item_name, quantity, unit, unit_price, amount, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            db()->beginTransaction();
            foreach ($result['rows'] as $row) {
                $amount = (int)round($row['quantity'] * $row['unit_price']);
                $insert->execute([
                    generate_uuid(), $projectId, $nextOrder++,
                    $row['supplier_name'], $row['item_name'], $row['quantity'], $row['unit'], $row['unit_price'], $amount, $row['notes'],
                ]);
            }
            db()->commit();

            flash('success', count($result['rows']) . '件の仕入明細を取り込みました');
            redirect('/projects/view.php?id=' . urlencode($projectId));
        }
    }
}

$pageTitle = '仕入明細のCSV取り込み';
$activeNav = 'projects';
require __DIR__ . '/../includes/layout_header.php';
?>

<h1>仕入明細をCSVから取り込む</h1>
<p class="muted"><?= h($project['customer_name']) ?> / <?= h($project['project_name']) ?></p>

<div class="card" style="max-width:560px;">
  <p>列見出し「仕入先,品目,数量,単位,単価,備考」のCSVファイルを取り込めます。数量は値引き行のためマイナスも入力できます。</p>
  <p><a href="?project_id=<?= h($projectId) ?>&template=1">テンプレートCSVをダウンロード</a></p>

  <?php if ($generalError): ?>
    <p class="error-text"><?= h($generalError) ?></p>
  <?php endif; ?>
  <?php if (!empty($rowErrors)): ?>
    <div class="flash flash-error">
      <p style="margin:0 0 6px;font-weight:600;">取り込めなかった行があります:</p>
      <ul style="margin:0;padding-left:18px;">
        <?php foreach ($rowErrors as $re): ?>
          <li><?= (int)$re['row'] ?>行目: <?= h($re['message']) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  <?php endif; ?>

  <form method="post" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <div class="field">
      <label for="file">CSVファイル</label>
      <input type="file" id="file" name="file" accept=".csv,text/csv">
    </div>
    <div class="field">
      <label for="encoding">文字コード</label>
      <select id="encoding" name="encoding">
        <option value="utf8">UTF-8</option>
        <option value="shift_jis">Shift_JIS(Excel等)</option>
      </select>
    </div>
    <div class="actions">
      <button type="submit" class="btn">取り込む</button>
      <a href="<?= BASE_PATH ?>/projects/view.php?id=<?= h($projectId) ?>" class="btn btn-outline">キャンセル</a>
    </div>
  </form>
</div>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
