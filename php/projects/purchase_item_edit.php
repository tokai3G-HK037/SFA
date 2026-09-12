<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/validation.php';

$id = get_str('id');
$stmt = db()->prepare('SELECT * FROM purchase_items WHERE id = ?');
$stmt->execute([$id]);
$item = $stmt->fetch();
if (!$item) {
    http_response_code(404);
    die('仕入明細が見つかりません');
}
$projectId = $item['project_id'];
$projStmt = db()->prepare('SELECT id, customer_name, project_name FROM projects WHERE id = ? AND is_deleted = 0');
$projStmt->execute([$projectId]);
$project = $projStmt->fetch();
if (!$project) {
    http_response_code(404);
    die('案件が見つかりません');
}

$values = $item;
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    [$data, $errors] = validate_purchase_item($_POST);
    $values = $_POST;

    if (empty($errors)) {
        $amount = (int)round($data['quantity'] * $data['unit_price']);
        $stmt = db()->prepare(
            'UPDATE purchase_items SET supplier_name=?, item_name=?, quantity=?, unit=?, unit_price=?, amount=?, notes=? WHERE id=?'
        );
        $stmt->execute([
            $data['supplier_name'], $data['item_name'], $data['quantity'], $data['unit'], $data['unit_price'], $amount, $data['notes'], $id,
        ]);
        flash('success', '仕入明細を更新しました');
        redirect('/projects/view.php?id=' . urlencode($projectId));
    }
}

$pageTitle = '仕入明細の編集';
$activeNav = 'projects';
require __DIR__ . '/../includes/layout_header.php';
?>

<h1>仕入明細の編集</h1>
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
    <button type="submit" class="btn">更新する</button>
    <a href="/projects/view.php?id=<?= h($projectId) ?>" class="btn btn-outline">キャンセル</a>
  </div>
</form>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
