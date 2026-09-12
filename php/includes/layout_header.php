<?php
// $activeNav (文字列: 'projects'|'estimates'|'exports'|'settings') と $pageTitle をincludeする側で設定しておくこと
$activeNav = $activeNav ?? '';
$pageTitle = $pageTitle ?? 'SFM';
$flashes = get_flashes();
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= h($pageTitle) ?> - SFM</title>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header class="site-header">
  <div class="site-header-inner">
    <span class="logo">SFM</span>
    <nav>
      <a href="/projects/index.php" class="<?= $activeNav === 'projects' ? 'active' : '' ?>">案件管理</a>
      <a href="/estimates/index.php" class="<?= $activeNav === 'estimates' ? 'active' : '' ?>">見積書</a>
      <a href="/exports/index.php" class="<?= $activeNav === 'exports' ? 'active' : '' ?>">データ出力</a>
      <a href="/settings/company.php" class="<?= $activeNav === 'settings' ? 'active' : '' ?>">自社情報</a>
    </nav>
  </div>
</header>
<main class="page">
<?php foreach ($flashes as $f): ?>
  <div class="flash flash-<?= h($f['type']) ?>"><?= h($f['message']) ?></div>
<?php endforeach; ?>
