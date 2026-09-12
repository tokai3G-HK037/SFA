<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/validation.php';

$projectId = get_str('project_id');
$stmt = db()->prepare('SELECT id, customer_name, project_name FROM projects WHERE id = ? AND is_deleted = 0');
$stmt->execute([$projectId]);
$project = $stmt->fetch();
if (!$project) {
    http_response_code(404);
    die('案件が見つかりません');
}

$values = ['quantity' => '1', 'unit_price' => '0'];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    [$data, $errors] = validate_purchase_item($_POST);
    $values = $_POST;

    if (empty($errors)) {
        $amount = (int)round($data['quantity'] * $data['unit_price']);
        $maxOrderStmt = db()->prepare('SELECT COALESCE(MAX(sort_order), -1) FROM purchase_items WHERE project_id = ?');
        $maxOrderStmt->execute([$projectId]);
        $nextOrder = (int)$maxOrderStmt->fetchColumn() + 1;

        $stmt = db()->prepare(
            'INSERT INTO purchase_items (id, project_id, sort_order, supplier_name, item_name, quantity, unit, unit_price, amount, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            generate_uuid(), $projectId, $nextOrder,
            $data['supplier_name'], $data['item_name'], $data['quantity'], $data['unit'], $data['unit_price'], $amount, $data['notes'],
        ]);
        flash('success', '仕入明細を追加しました');
        redirect('/projects/view.php?id=' . urlencode($projectId));
    }
}

$pageTitle = '仕入明細の追加';
$activeNav = 'projects';
require __DIR__ . '/../includes/layout_header.php';
?>

<h1>仕入明細の追加</h1>
<p class="muted"><?= h($project['customer_name']) ?> / <?= h($project['project_name']) ?></p>

<form method="post" class="card" style="max-width:520px;">
  <?= csrf_field() ?>
  <div class="field">
    <label for="supplier_name">仕入先</label>
    <input type="text" id="supplier_name" name="supplier_name" value="<?= v($values, 'supplier_name') ?>">
    <?= err($errors, 'supplier_name') ?>
  </div>
  <div class="field">
    <label for="item_name">品目</label>
    <input type="text" id="item_name" name="item_name" value="<?= v($values, 'item_name') ?>">
    <?= err($errors, 'item_name') ?>
  </div>
  <div class="row-2">
    <div class="field">
      <label for="quantity">数量(値引きの場合はマイナス可)</label>
      <input type="number" step="0.01" id="quantity" name="quantity" value="<?= v($values, 'quantity') ?>">
      <?= err($errors, 'quantity') ?>
    </div>
    <div class="field">
      <label for="unit">単位</label>
      <input type="text" id="unit" name="unit" value="<?= v($values, 'unit') ?>">
    </div>
  </div>
  <div class="field">
    <label for="unit_price">単価(円)</label>
    <input type="number" step="1" id="unit_price" name="unit_price" value="<?= v($values, 'unit_price') ?>">
    <?= err($errors, 'unit_price') ?>
  </div>
  <div class="field">
    <label for="notes">備考</label>
    <input type="text" id="notes" name="notes" value="<?= v($values, 'notes') ?>">
  </div>
  <div class="actions">
    <button type="submit" class="btn">保存</button>
    <a href="<?= BASE_PATH ?>/projects/view.php?id=<?= h($projectId) ?>" class="btn btn-outline">キャンセル</a>
  </div>
</form>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
