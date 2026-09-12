<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/projects/index.php');
}
verify_csrf();

$id = post_str('id');
$stmt = db()->prepare('UPDATE projects SET is_deleted = 1 WHERE id = ?');
$stmt->execute([$id]);

flash('success', '案件を削除しました');
redirect('/projects/index.php');
