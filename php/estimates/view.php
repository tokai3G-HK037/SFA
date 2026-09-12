<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$id = get_str('id');
$stmt = db()->prepare(
    'SELECT e.*, p.id AS proj_id, p.customer_name, p.project_name
     FROM estimates e JOIN projects p ON p.id = e.project_id
     WHERE e.id = ?'
);
$stmt->execute([$id]);
$estimate = $stmt->fetch();
if (!$estimate) {
    http_response_code(404);
    die('見積書が見つかりません');
}
$itemsStmt = db()->prepare('SELECT * FROM estimate_items WHERE estimate_id = ? ORDER BY sort_order ASC');
$itemsStmt->execute([$id]);
$items = $itemsStmt->fetchAll();

$pageTitle = $estimate['estimate_number'];
$activeNav = 'estimates';
require __DIR__ . '/../includes/layout_header.php';
?>

<div class="page-header">
  <div>
    <div style="display:flex;align-items:center;gap:10px;">
      <h1><?= h($estimate['estimate_number']) ?></h1>
      <span class="badge <?= $estimate['status'] === 'FINALIZED' ? 'badge-default' : 'badge-secondary' ?>"><?= h(estimate_status_label($estimate['status'])) ?></span>
    </div>
    <a href="/projects/view.php?id=<?= h($estimate['proj_id']) ?>" class="muted"><?= h($estimate['customer_name']) ?> / <?= h($estimate['project_name']) ?></a>
  </div>
  <div class="actions">
    <a href="/estimates/edit.php?id=<?= h($id) ?>" class="btn btn-outline">編集</a>
    <form method="post" action="/estimates/delete.php" onsubmit="return confirm('見積書を削除しますか?この操作は取り消せません。');" style="display:inline;">
      <?= csrf_field() ?>
      <input type="hidden" name="id" value="<?= h($id) ?>">
      <button type="submit" class="btn btn-outline">削除</button>
    </form>
  </div>
</div>

<div class="preview-box">
  <div class="preview-top">
    <div class="muted" style="font-size:13px;">
      <p style="margin:2px 0;">見積番号: <?= h($estimate['estimate_number']) ?></p>
      <p style="margin:2px 0;">発行日: <?= format_date($estimate['issue_date']) ?></p>
      <?php if ($estimate['valid_until']): ?><p style="margin:2px 0;">有効期限: <?= format_date($estimate['valid_until']) ?></p><?php endif; ?>
    </div>
    <div class="preview-issuer">
      <p style="margin:2px 0;font-weight:700;"><?= h($estimate['issuer_name']) ?></p>
      <?php if ($estimate['issuer_address']): ?><p style="margin:2px 0;"><?= h($estimate['issuer_address']) ?></p><?php endif; ?>
      <?php if ($estimate['issuer_contact']): ?><p style="margin:2px 0;"><?= h($estimate['issuer_contact']) ?></p><?php endif; ?>
    </div>
  </div>

  <h1 class="doc-title">御見積書</h1>

  <div class="preview-addressee">
    <span class="name"><?= h($estimate['addressee']) ?></span>
    <span class="total"><?= format_yen($estimate['total_amount']) ?> <span class="tax-note">(税込)</span></span>
  </div>

  <p style="font-weight:600;"><?= h($estimate['title']) ?></p>

  <table>
    <thead>
      <tr class="muted"><th>品名</th><th class="num">数量</th><th>単位</th><th class="num">単価</th><th class="num">金額</th></tr>
    </thead>
    <tbody>
      <?php foreach ($items as $item): ?>
        <tr>
          <td><?= h($item['name']) ?></td>
          <td class="num"><?= rtrim(rtrim(number_format((float)$item['quantity'], 2), '0'), '.') ?></td>
          <td><?= h($item['unit'] ?: '') ?></td>
          <td class="num"><?= format_yen($item['unit_price']) ?></td>
          <td class="num"><?= format_yen($item['amount']) ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>

  <div class="summary-box" style="margin-top:12px;">
    <div class="line"><span class="muted">小計</span><span><?= format_yen($estimate['subtotal']) ?></span></div>
    <div class="line"><span class="muted">消費税(<?= h(tax_type_label($estimate['tax_type'])) ?> <?= rtrim(rtrim(number_format((float)$estimate['tax_rate'], 2), '0'), '.') ?>%)</span><span><?= format_yen($estimate['tax_amount']) ?></span></div>
    <div class="line total"><span>合計</span><span><?= format_yen($estimate['total_amount']) ?></span></div>
  </div>

  <?php if ($estimate['notes']): ?>
    <div style="border-top:1px solid #eee;margin-top:16px;padding-top:12px;white-space:pre-wrap;color:#666;font-size:13px;">
      <?= h($estimate['notes']) ?>
    </div>
  <?php endif; ?>
</div>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
