<?php
// 本番環境での不具合切り分け用の一時的な診断ページ。
// 確認が終わったら、このファイルはサーバーから削除してください(情報が外部に見えてしまうため)。

header('Content-Type: text/plain; charset=utf-8');

echo "=== PHP情報 ===\n";
echo "PHPバージョン: " . PHP_VERSION . "\n";
echo "pdo_mysql拡張: " . (extension_loaded('pdo_mysql') ? '有効' : '【無効・未インストール】') . "\n";
echo "pdo拡張: " . (extension_loaded('pdo') ? '有効' : '【無効・未インストール】') . "\n";
echo "利用可能なPDOドライバ: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
echo "\n";

echo "=== config.php の読み込み ===\n";
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    echo "【エラー】config.php が見つかりません: {$configPath}\n";
} else {
    echo "config.php: 見つかりました\n";
    require_once $configPath;
    echo "DB_HOST: " . (defined('DB_HOST') ? DB_HOST : '(未定義)') . "\n";
    echo "DB_NAME: " . (defined('DB_NAME') ? DB_NAME : '(未定義)') . "\n";
    echo "DB_USER: " . (defined('DB_USER') ? DB_USER : '(未定義)') . "\n";
    echo "DB_PASS: " . (defined('DB_PASS') ? str_repeat('*', strlen(DB_PASS)) : '(未定義)') . " (長さ: " . (defined('DB_PASS') ? strlen(DB_PASS) : 0) . ")\n";
    echo "BASE_PATH: " . (defined('BASE_PATH') ? "'" . BASE_PATH . "'" : '(未定義)') . "\n";
}
echo "\n";

echo "=== データベース接続テスト ===\n";
if (defined('DB_HOST')) {
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . (defined('DB_CHARSET') ? DB_CHARSET : 'utf8mb4');
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        echo "接続成功!\n";
        $stmt = $pdo->query('SHOW TABLES');
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "テーブル数: " . count($tables) . "\n";
        echo "テーブル一覧: " . implode(', ', $tables) . "\n";
    } catch (Throwable $e) {
        echo "【接続エラー】\n";
        echo "メッセージ: " . $e->getMessage() . "\n";
        echo "コード: " . $e->getCode() . "\n";
    }
} else {
    echo "config.php が正しく読み込めなかったためスキップしました\n";
}
