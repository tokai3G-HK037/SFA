<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$company = db()->query("SELECT * FROM company_profile WHERE id = 'default'")->fetch();
$values = $company ?: [];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $values = $_POST;

    $companyName = trim($_POST['company_name'] ?? '');
    if ($companyName === '') {
        $errors['company_name'] = '会社名を入力してください';
    }

    if (empty($errors)) {
        $stmt = db()->prepare(
            "INSERT INTO company_profile (id, company_name, postal_code, address, phone, contact_name)
             VALUES ('default', ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE company_name=VALUES(company_name), postal_code=VALUES(postal_code),
               address=VALUES(address), phone=VALUES(phone), contact_name=VALUES(contact_name)"
        );
        $stmt->execute([
            $companyName,
            trim($_POST['postal_code'] ?? '') ?: null,
            trim($_POST['address'] ?? '') ?: null,
            trim($_POST['phone'] ?? '') ?: null,
            trim($_POST['contact_name'] ?? '') ?: null,
        ]);
        flash('success', '自社情報を更新しました');
        redirect('/settings/company.php');
    }
}

$pageTitle = '自社情報設定';
$activeNav = 'settings';
require __DIR__ . '/../includes/layout_header.php';
?>

<h1>自社情報設定</h1>
<p class="muted">見積書の発行者情報の初期値として使用されます。</p>

<form method="post" class="card" style="max-width:560px;">
  <?= csrf_field() ?>
  <div class="field">
    <label for="company_name">会社名</label>
    <input type="text" id="company_name" name="company_name" value="<?= v($values, 'company_name') ?>">
    <?= err($errors, 'company_name') ?>
  </div>
  <div class="row-2">
    <div class="field">
      <label for="postal_code">郵便番号</label>
      <input type="text" id="postal_code" name="postal_code" value="<?= v($values, 'postal_code') ?>">
    </div>
    <div class="field">
      <label for="phone">電話番号</label>
      <input type="text" id="phone" name="phone" value="<?= v($values, 'phone') ?>">
    </div>
  </div>
  <div class="field">
    <label for="address">住所</label>
    <input type="text" id="address" name="address" value="<?= v($values, 'address') ?>">
  </div>
  <div class="field">
    <label for="contact_name">担当者名</label>
    <input type="text" id="contact_name" name="contact_name" value="<?= v($values, 'contact_name') ?>">
  </div>
  <div class="actions">
    <button type="submit" class="btn">保存する</button>
  </div>
</form>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
