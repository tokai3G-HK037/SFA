<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$id = get_str('id');
$stmt = db()->prepare('SELECT * FROM projects WHERE id = ? AND is_deleted = 0');
$stmt->execute([$id]);
$project = $stmt->fetch();
if (!$project) {
    http_response_code(404);
    die('案件が見つかりません');
}

$itemsStmt = db()->prepare('SELECT * FROM purchase_items WHERE project_id = ? ORDER BY sort_order ASC');
$itemsStmt->execute([$id]);
$purchaseItems = $itemsStmt->fetchAll();
$purchaseTotal = 0;
foreach ($purchaseItems as $pi) {
    $purchaseTotal += (float)$pi['amount'];
}

$estStmt = db()->prepare('SELECT * FROM estimates WHERE project_id = ? ORDER BY issue_date DESC');
$estStmt->execute([$id]);
$estimates = $estStmt->fetchAll();

$hasEndUserInfo = $project['end_user_name'] || $project['end_user_contact_person'] || $project['end_user_address'] || $project['end_user_contact'];

$pageTitle = $project['project_name'];
$activeNav = 'projects';
require __DIR__ . '/../includes/layout_header.php';
?>

<div class="page-header">
  <div>
    <div style="display:flex;align-items:center;gap:10px;">
      <h1>
        <?php if ($project['end_user_name']): ?><?= h($project['end_user_name']) ?> ・ <?php endif; ?><?= h($project['project_name']) ?>
      </h1>
      <span class="badge <?= h(PROJECT_STATUS_BADGE_CLASS[$project['status']]) ?>"><?= h(project_status_label($project['status'])) ?></span>
    </div>
    <p class="muted"><?= h($project['customer_name']) ?></p>
  </div>
  <div class="actions">
    <a href="/projects/edit.php?id=<?= h($id) ?>" class="btn btn-outline">編集</a>
    <form method="post" action="/projects/delete.php" onsubmit="return confirm('案件を削除しますか?この操作は取り消せません。');" style="display:inline;">
      <?= csrf_field() ?>
      <input type="hidden" name="id" value="<?= h($id) ?>">
      <button type="submit" class="btn btn-outline">削除</button>
    </form>
    <a href="/estimates/new.php?project_id=<?= h($id) ?>" class="btn">見積書を作成</a>
  </div>
</div>

<div class="card">
  <div class="info-grid">
    <div><p class="label">担当者</p><p><?= h($project['assignee'] ?: '-') ?></p></div>
    <div><p class="label">想定金額</p><p><?= format_yen($project['amount']) ?></p></div>
    <div><p class="label">予定納期</p><p><?= format_date($project['expected_delivery_date']) ?></p></div>
    <div><p class="label">備考</p><p style="white-space:pre-wrap;"><?= h($project['notes'] ?: '-') ?></p></div>
  </div>
</div>

<?php if ($hasEndUserInfo): ?>
<div class="end-user-block">
  <h2>エンドユーザー情報</h2>
  <div class="card">
    <div class="info-grid">
      <div><p class="label">名称</p><p><?= h($project['end_user_name'] ?: '-') ?></p></div>
      <div><p class="label">担当者</p><p><?= h($project['end_user_contact_person'] ?: '-') ?></p></div>
      <div><p class="label">住所</p><p><?= h($project['end_user_address'] ?: '-') ?></p></div>
      <div><p class="label">連絡先</p><p><?= h($project['end_user_contact'] ?: '-') ?></p></div>
    </div>
  </div>
</div>
<?php endif; ?>

<div class="section-header">
  <h2>仕入明細</h2>
  <div class="actions">
    <a href="/projects/purchase_item_import.php?project_id=<?= h($id) ?>" class="btn btn-outline btn-sm">CSVから取り込む</a>
    <a href="/projects/purchase_item_new.php?project_id=<?= h($id) ?>" class="btn btn-sm">仕入明細を追加</a>
  </div>
</div>
<div class="table-wrap">
<table>
  <thead>
    <tr>
      <th>仕入先</th><th>品目</th><th class="num">数量</th><th>単位</th><th class="num">単価</th><th class="num">金額</th><th></th>
    </tr>
  </thead>
  <tbody>
    <?php if (empty($purchaseItems)): ?>
      <tr><td colspan="7" class="muted" style="text-align:center;padding:24px;">仕入明細はまだありません</td></tr>
    <?php endif; ?>
    <?php foreach ($purchaseItems as $pi): ?>
      <tr>
        <td><?= h($pi['supplier_name']) ?></td>
        <td><?= h($pi['item_name']) ?></td>
        <td class="num"><?= rtrim(rtrim(number_format((float)$pi['quantity'], 2), '0'), '.') ?></td>
        <td><?= h($pi['unit'] ?: '-') ?></td>
        <td class="num"><?= format_yen($pi['unit_price']) ?></td>
        <td class="num"><?= format_yen($pi['amount']) ?></td>
        <td>
          <a href="/projects/purchase_item_edit.php?id=<?= h($pi['id']) ?>" class="btn btn-ghost btn-sm">編集</a>
          <form method="post" action="/projects/purchase_item_delete.php" onsubmit="return confirm('この仕入明細を削除しますか?');" style="display:inline;">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= h($pi['id']) ?>">
            <input type="hidden" name="project_id" value="<?= h($id) ?>">
            <button type="submit" class="btn btn-ghost btn-sm">削除</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
</div>
<?php if (!empty($purchaseItems)): ?>
  <p class="muted" style="text-align:right;">仕入合計: <?= format_yen($purchaseTotal) ?></p>
<?php endif; ?>

<h2 style="margin-top:24px;">見積書</h2>
<?php if (empty($estimates)): ?>
  <p class="muted">この案件に紐づく見積書はまだありません</p>
<?php else: ?>
  <div class="table-wrap">
    <?php foreach ($estimates as $est): ?>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid #eee;">
        <a href="/estimates/view.php?id=<?= h($est['id']) ?>" style="display:flex;align-items:center;gap:8px;">
          <span class="badge <?= $est['status'] === 'FINALIZED' ? 'badge-default' : 'badge-secondary' ?>"><?= h(estimate_status_label($est['status'])) ?></span>
          <?= h($est['estimate_number']) ?> - <?= h($est['title']) ?>
        </a>
        <span><?= format_yen($est['total_amount']) ?></span>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
