<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/validation.php';

$values = ['status' => 'ESTIMATING', 'amount' => '0'];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    [$data, $errors] = validate_project($_POST);
    $values = $_POST;

    if (empty($errors)) {
        $id = generate_uuid();
        $stmt = db()->prepare(
            'INSERT INTO projects
             (id, customer_name, project_name, assignee, status, amount, expected_delivery_date, notes,
              end_user_name, end_user_contact_person, end_user_address, end_user_contact)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id, $data['customer_name'], $data['project_name'], $data['assignee'], $data['status'],
            $data['amount'], $data['expected_delivery_date'], $data['notes'],
            $data['end_user_name'], $data['end_user_contact_person'], $data['end_user_address'], $data['end_user_contact'],
        ]);
        flash('success', '案件を登録しました');
        redirect('/projects/view.php?id=' . urlencode($id));
    }
}

$pageTitle = '新規案件登録';
$activeNav = 'projects';
require __DIR__ . '/../includes/layout_header.php';
?>

<h1>新規案件登録</h1>

<form method="post" class="card" style="max-width:640px;">
  <?= csrf_field() ?>
  <?php require __DIR__ . '/_form_fields.php'; ?>
  <div class="actions">
    <button type="submit" class="btn">登録する</button>
    <a href="<?= BASE_PATH ?>/projects/index.php" class="btn btn-outline">キャンセル</a>
  </div>
</form>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
