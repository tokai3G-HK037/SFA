<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$query = get_str('query');
$status = get_str('status');

$where = ['is_deleted = 0'];
$params = [];
if ($query !== '') {
    $where[] = '(customer_name LIKE ? OR project_name LIKE ? OR end_user_name LIKE ?)';
    $like = '%' . $query . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}
if ($status !== '' && in_array($status, PROJECT_STATUS_VALUES, true)) {
    $where[] = 'status = ?';
    $params[] = $status;
}

$sql = 'SELECT * FROM projects WHERE ' . implode(' AND ', $where) . ' ORDER BY updated_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$projects = $stmt->fetchAll();

$pageTitle = '案件管理';
$activeNav = 'projects';
require __DIR__ . '/../includes/layout_header.php';
?>

<div class="page-header">
  <h1>案件管理</h1>
  <div class="actions">
    <a href="/projects/new.php" class="btn">新規案件を登録</a>
  </div>
</div>

<form method="get" class="filters">
  <input type="text" name="query" placeholder="顧客名・エンドユーザー名・案件名で検索" value="<?= h($query) ?>">
  <select name="status" onchange="this.form.submit()">
    <option value="">すべてのステータス</option>
    <?php foreach (PROJECT_STATUS_VALUES as $value): ?>
      <option value="<?= h($value) ?>" <?= $status === $value ? 'selected' : '' ?>><?= h(project_status_label($value)) ?></option>
    <?php endforeach; ?>
  </select>
  <button type="submit" class="btn btn-outline btn-sm">検索</button>
</form>

<div class="table-wrap">
<table>
  <thead>
    <tr>
      <th>顧客名</th>
      <th>エンドユーザー・案件名</th>
      <th>担当者</th>
      <th>ステータス</th>
      <th class="num">金額</th>
      <th>予定納期</th>
    </tr>
  </thead>
  <tbody>
    <?php if (empty($projects)): ?>
      <tr><td colspan="6" class="muted" style="text-align:center;padding:32px;">該当する案件がありません</td></tr>
    <?php endif; ?>
    <?php foreach ($projects as $p): ?>
      <tr>
        <td><a href="/projects/view.php?id=<?= h($p['id']) ?>"><?= h($p['customer_name']) ?></a></td>
        <td>
          <a href="/projects/view.php?id=<?= h($p['id']) ?>">
            <?php if (!empty($p['end_user_name'])): ?>
              <span class="muted" style="display:block;font-size:12px;"><?= h($p['end_user_name']) ?></span>
            <?php endif; ?>
            <?= h($p['project_name']) ?>
          </a>
        </td>
        <td><?= h($p['assignee'] ?: '-') ?></td>
        <td><span class="badge <?= h(PROJECT_STATUS_BADGE_CLASS[$p['status']]) ?>"><?= h(project_status_label($p['status'])) ?></span></td>
        <td class="num"><?= format_yen($p['amount']) ?></td>
        <td><?= format_date($p['expected_delivery_date']) ?></td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
</div>
<p class="muted">全 <?= count($projects) ?> 件</p>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
