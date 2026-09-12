<?php
// 案件フォームの入力欄(new.php / edit.php で共通利用)
// 事前に $values (連想配列) と $errors (連想配列) を用意しておくこと
$values = $values ?? [];
$errors = $errors ?? [];
?>
<div class="field">
  <label for="customer_name">顧客名</label>
  <input type="text" id="customer_name" name="customer_name" value="<?= v($values, 'customer_name') ?>">
  <?= err($errors, 'customer_name') ?>
</div>

<div class="field">
  <label for="project_name">案件名</label>
  <input type="text" id="project_name" name="project_name" value="<?= v($values, 'project_name') ?>">
  <?= err($errors, 'project_name') ?>
</div>

<div class="row-2">
  <div class="field">
    <label for="assignee">担当者</label>
    <input type="text" id="assignee" name="assignee" value="<?= v($values, 'assignee') ?>">
  </div>
  <div class="field">
    <label for="status">ステータス</label>
    <select id="status" name="status">
      <?php foreach (PROJECT_STATUS_VALUES as $sv): ?>
        <option value="<?= h($sv) ?>" <?= ($values['status'] ?? 'ESTIMATING') === $sv ? 'selected' : '' ?>><?= h(project_status_label($sv)) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
</div>

<div class="row-2">
  <div class="field">
    <label for="amount">想定金額(円)</label>
    <input type="number" step="1" id="amount" name="amount" value="<?= v($values, 'amount') ?: '0' ?>">
    <?= err($errors, 'amount') ?>
  </div>
  <div class="field">
    <label for="expected_delivery_date">予定納期</label>
    <input type="date" id="expected_delivery_date" name="expected_delivery_date" value="<?= v($values, 'expected_delivery_date') ?>">
  </div>
</div>

<div class="field">
  <label for="notes">備考</label>
  <textarea id="notes" name="notes" rows="4"><?= v($values, 'notes') ?></textarea>
</div>

<h2 style="margin-top:24px;">エンドユーザー情報</h2>
<div class="row-2">
  <div class="field">
    <label for="end_user_name">名称</label>
    <input type="text" id="end_user_name" name="end_user_name" value="<?= v($values, 'end_user_name') ?>">
  </div>
  <div class="field">
    <label for="end_user_contact_person">担当者</label>
    <input type="text" id="end_user_contact_person" name="end_user_contact_person" value="<?= v($values, 'end_user_contact_person') ?>">
  </div>
</div>
<div class="field">
  <label for="end_user_address">住所</label>
  <input type="text" id="end_user_address" name="end_user_address" value="<?= v($values, 'end_user_address') ?>">
</div>
<div class="field">
  <label for="end_user_contact">連絡先</label>
  <input type="text" id="end_user_contact" name="end_user_contact" value="<?= v($values, 'end_user_contact') ?>">
</div>
