<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/estimates/index.php');
}
verify_csrf();

$id = post_str('id');
db()->prepare('DELETE FROM estimates WHERE id = ?')->execute([$id]);

flash('success', '見積書を削除しました');
redirect('/estimates/index.php');
