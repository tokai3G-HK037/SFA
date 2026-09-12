<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/calc.php';

$projects = db()->query('SELECT id, customer_name, project_name FROM projects WHERE is_deleted = 0 ORDER BY updated_at DESC')->fetchAll();

$defaultProjectId = get_str('project_id');
$company = db()->query("SELECT * FROM company_profile WHERE id = 'default'")->fetch();

$values = [
    'project_id' => $defaultProjectId,
    'issue_date' => date('Y-m-d'),
    'tax_rate' => '10',
    'tax_type' => 'EXCLUSIVE',
    'status' => 'DRAFT',
    'issuer_name' => $company['company_name'] ?? '',
    'issuer_address' => $company['address'] ?? '',
    'issuer_contact' => trim(($company['contact_name'] ?? '') . ' / ' . ($company['phone'] ?? ''), ' /'),
];
$items = [['name' => '', 'quantity' => '1', 'unit' => '', 'unit_price' => '0', 'notes' => '']];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    [$data, $errors] = validate_estimate($_POST);
    $values = $_POST;
    $items = !empty($_POST['items']) ? $_POST['items'] : $items;

    if (empty($errors)) {
        $amounts = calculate_estimate_amounts($data['items'], $data['tax_rate'], $data['tax_type']);
        $estimateNumber = generate_estimate_number($data['issue_date']);
        $id = generate_uuid();

        db()->beginTransaction();
        $stmt = db()->prepare(
            'INSERT INTO estimates
             (id, project_id, estimate_number, title, addressee, issuer_name, issuer_address, issuer_contact,
              issue_date, valid_until, tax_rate, tax_type, subtotal, tax_amount, total_amount, status, notes)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $id, $data['project_id'], $estimateNumber, $data['title'], $data['addressee'],
            $data['issuer_name'], $data['issuer_address'], $data['issuer_contact'],
            $data['issue_date'], $data['valid_until'], $data['tax_rate'], $data['tax_type'],
            $amounts['subtotal'], $amounts['tax_amount'], $amounts['total_amount'], $data['status'], $data['notes'],
        ]);

        $itemStmt = db()->prepare(
            'INSERT INTO estimate_items (id, estimate_id, sort_order, name, quantity, unit, unit_price, amount, notes)
             VALUES (?,?,?,?,?,?,?,?,?)'
        );
        foreach ($data['items'] as $index => $item) {
            $amount = (int)round($item['quantity'] * $item['unit_price']);
            $itemStmt->execute([
                generate_uuid(), $id, $index, $item['name'], $item['quantity'], $item['unit'], $item['unit_price'], $amount, $item['notes'],
            ]);
        }
        db()->commit();

        flash('success', '見積書を作成しました');
        redirect('/estimates/view.php?id=' . urlencode($id));
    }
}

$pageTitle = '見積書の作成';
$activeNav = 'estimates';
require __DIR__ . '/../includes/layout_header.php';
?>

<h1>見積書の作成</h1>

<form method="post" class="card">
  <?= csrf_field() ?>

  <div class="field">
    <label for="project_id">案件</label>
    <select id="project_id" name="project_id">
      <option value="">案件を選択してください</option>
      <?php foreach ($projects as $p): ?>
        <option value="<?= h($p['id']) ?>" <?= ($values['project_id'] ?? '') === $p['id'] ? 'selected' : '' ?>>
          <?= h($p['customer_name']) ?> / <?= h($p['project_name']) ?>
        </option>
      <?php endforeach; ?>
    </select>
    <?= err($errors, 'project_id') ?>
  </div>

  <div class="field">
    <label for="title">件名</label>
    <input type="text" id="title" name="title" value="<?= v($values, 'title') ?>">
    <?= err($errors, 'title') ?>
  </div>

  <div class="field">
    <label for="addressee">宛先</label>
    <input type="text" id="addressee" name="addressee" placeholder="株式会社〇〇 御中" value="<?= v($values, 'addressee') ?>">
    <?= err($errors, 'addressee') ?>
  </div>

  <div class="row-3">
    <div class="field">
      <label for="issuer_name">発行者名</label>
      <input type="text" id="issuer_name" name="issuer_name" value="<?= v($values, 'issuer_name') ?>">
      <?= err($errors, 'issuer_name') ?>
    </div>
    <div class="field">
      <label for="issuer_address">発行者住所</label>
      <input type="text" id="issuer_address" name="issuer_address" value="<?= v($values, 'issuer_address') ?>">
    </div>
    <div class="field">
      <label for="issuer_contact">発行者連絡先</label>
      <input type="text" id="issuer_contact" name="issuer_contact" value="<?= v($values, 'issuer_contact') ?>">
    </div>
  </div>

  <div class="row-4">
    <div class="field">
      <label for="issue_date">発行日</label>
      <input type="date" id="issue_date" name="issue_date" value="<?= v($values, 'issue_date') ?>">
      <?= err($errors, 'issue_date') ?>
    </div>
    <div class="field">
      <label for="valid_until">有効期限</label>
      <input type="date" id="valid_until" name="valid_until" value="<?= v($values, 'valid_until') ?>">
    </div>
    <div class="field">
      <label for="taxRate">消費税率(%)</label>
      <input type="number" step="0.1" id="taxRate" name="tax_rate" value="<?= v($values, 'tax_rate') ?>">
    </div>
    <div class="field">
      <label for="taxType">税区分</label>
      <select id="taxType" name="tax_type">
        <?php foreach (TAX_TYPE_VALUES as $tv): ?>
          <option value="<?= h($tv) ?>" <?= ($values['tax_type'] ?? 'EXCLUSIVE') === $tv ? 'selected' : '' ?>><?= h(tax_type_label($tv)) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>

  <div class="field" style="max-width:220px;">
    <label for="status">ステータス</label>
    <select id="status" name="status">
      <?php foreach (ESTIMATE_STATUS_VALUES as $sv): ?>
        <option value="<?= h($sv) ?>" <?= ($values['status'] ?? 'DRAFT') === $sv ? 'selected' : '' ?>><?= h(estimate_status_label($sv)) ?></option>
      <?php endforeach; ?>
    </select>
  </div>

  <h2 style="margin-top:20px;">明細</h2>
  <div class="table-wrap">
    <table class="item-rows-table" id="estimate-items-table">
      <thead>
        <tr><th style="width:38%;">品名</th><th>数量</th><th>単位</th><th>単価</th><th class="num">金額</th><th></th></tr>
      </thead>
      <tbody>
        <?php foreach ($items as $i => $item): ?>
          <tr>
            <td><input type="text" name="items[<?= $i ?>][name]" value="<?= h($item['name'] ?? '') ?>"></td>
            <td><input type="number" step="0.01" class="qty-input" name="items[<?= $i ?>][quantity]" value="<?= h($item['quantity'] ?? '1') ?>"></td>
            <td><input type="text" name="items[<?= $i ?>][unit]" value="<?= h($item['unit'] ?? '') ?>"></td>
            <td><input type="number" step="1" class="price-input" name="items[<?= $i ?>][unit_price]" value="<?= h($item['unit_price'] ?? '0') ?>"></td>
            <td class="num row-amount">0円</td>
            <td><button type="button" class="btn btn-ghost btn-sm remove-row">削除</button></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php if (isset($errors['items'])): ?><p class="error-text"><?= h($errors['items']) ?></p><?php endif; ?>
  <div class="actions" style="margin-bottom:16px;">
    <button type="button" id="add-item-row" class="btn btn-outline btn-sm">明細行を追加</button>
  </div>

  <div class="summary-box">
    <div class="line"><span class="muted">小計</span><span id="summary-subtotal">0円</span></div>
    <div class="line"><span class="muted">消費税</span><span id="summary-tax">0円</span></div>
    <div class="line total"><span>合計</span><span id="summary-total">0円</span></div>
  </div>

  <div class="field" style="margin-top:16px;">
    <label for="notes">備考</label>
    <textarea id="notes" name="notes" rows="3"><?= v($values, 'notes') ?></textarea>
  </div>

  <div class="actions">
    <button type="submit" class="btn">作成する</button>
    <a href="<?= BASE_PATH ?>/estimates/index.php" class="btn btn-outline">キャンセル</a>
  </div>
</form>

<script src="<?= BASE_PATH ?>/assets/app.js"></script>

<?php require __DIR__ . '/../includes/layout_footer.php'; ?>
