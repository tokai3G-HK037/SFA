<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/projects/index.php');
}
verify_csrf();

$id = post_str('id');
$projectId = post_str('project_id');

$stmt = db()->prepare('DELETE FROM purchase_items WHERE id = ? AND project_id = ?');
$stmt->execute([$id, $projectId]);

flash('success', '仕入明細を削除しました');
redirect('/projects/view.php?id=' . urlencode($projectId));
