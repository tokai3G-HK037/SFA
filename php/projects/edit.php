<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/validation.php';

$id = get_str('id');
$stmt = db()->prepare('SELECT * FROM projects WHERE id = ? AND is_deleted = 0');
$stmt->execute([$id]);
$project = $stmt->fetch();
if (!$project) {
    http_response_code(404);
    die('案件が見つかりません');
}

$errors = [];
$values = $project;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    [$data, $errors] = validate_project($_POST);
    $values = $_POST;

    if (empty($errors)) {
        $stmt = db()->prepare(
            'UPDATE projects SET
               customer_name = ?, project_name = ?, assignee = ?, status = ?, amount = ?,
               expected_delivery_date = ?, notes = ?,
               end_user_name = ?, end_user_contact_person = ?, end_user_address = ?, end_user_contact = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $data['customer_name'], $data['project_name'], $data['assignee'], $data['status'], $data['amount'],
            $data['expected_delivery_date'], $data['notes'],
            $data['end_user_name'], $data['end_user_contact_person'], $data['end_user_address'], $data['end_user_contact'],
            $id,
        ]);
        flash('success', '案件を更新しました');
        redirect('/projects/view.php?id=' . urlencode($id));
    }
}

$pageTitle = '案件の編集';
$activeNav = 'projects';
require __DIR__ . '/../includes/layout_header.php';
?>

<h1>案件の編集</h1>

<form method="post" class="card" style="max-width:640px;">
  <?= csrf_field() ?>
  <?php require __DIR__ . '/_form_fields.php'; ?>
  <div class="actions">
    <button type="submit" class="btn">更新する</button>
    <a href="/projects/view.php?id=<?= h($id) ?>" class="btn btn-outline">キャンセル</a>
  </div>
</form>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
