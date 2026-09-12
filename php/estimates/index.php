<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$stmt = db()->query(
    'SELECT e.*, p.customer_name, p.project_name
     FROM estimates e
     JOIN projects p ON p.id = e.project_id
     ORDER BY e.issue_date DESC'
);
$estimates = $stmt->fetchAll();

$pageTitle = '見積書';
$activeNav = 'estimates';
require __DIR__ . '/../includes/layout_header.php';
?>

<div class="page-header">
  <h1>見積書</h1>
  <div class="actions">
    <a href="<?= BASE_PATH ?>/estimates/new.php" class="btn">新規見積書を作成</a>
  </div>
</div>

<div class="table-wrap">
<table>
  <thead>
    <tr>
      <th>見積番号</th><th>顧客名 / 案件名</th><th>件名</th><th>発行日</th><th>ステータス</th><th class="num">金額</th>
    </tr>
  </thead>
  <tbody>
    <?php if (empty($estimates)): ?>
      <tr><td colspan="6" class="muted" style="text-align:center;padding:32px;">見積書はまだありません</td></tr>
    <?php endif; ?>
    <?php foreach ($estimates as $e): ?>
      <tr>
        <td><a href="<?= BASE_PATH ?>/estimates/view.php?id=<?= h($e['id']) ?>"><?= h($e['estimate_number']) ?></a></td>
        <td><?= h($e['customer_name']) ?> / <?= h($e['project_name']) ?></td>
        <td><?= h($e['title']) ?></td>
        <td><?= format_date($e['issue_date']) ?></td>
        <td><span class="badge <?= $e['status'] === 'FINALIZED' ? 'badge-default' : 'badge-secondary' ?>"><?= h(estimate_status_label($e['status'])) ?></span></td>
        <td class="num"><?= format_yen($e['total_amount']) ?></td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
</div>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
