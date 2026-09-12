<?php
// 共通ヘルパー関数

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** HTMLエスケープ */
function h($value): string
{
    if ($value === null) {
        return '';
    }
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

/** リダイレクトして終了。$urlが"/"始まりのアプリ内パスの場合はBASE_PATHを自動付与する */
function redirect(string $url): void
{
    if (isset($url[0]) && $url[0] === '/') {
        $url = BASE_PATH . $url;
    }
    header('Location: ' . $url);
    exit;
}

/** アプリ内の"/"始まりパスにBASE_PATHを付与する(テンプレート内のリンク生成用) */
function url(string $path): string
{
    return BASE_PATH . $path;
}

/** UUID v4 を生成する(PrismaのUUID主キーと同じ形式) */
function generate_uuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

/** 現在日時(MySQL DATETIME形式) */
function now_str(): string
{
    return date('Y-m-d H:i:s');
}

// ── フラッシュメッセージ ─────────────────────────────

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function get_flashes(): array
{
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $flashes;
}

// ── CSRF対策 ─────────────────────────────

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf_token" value="' . h(csrf_token()) . '">';
}

function verify_csrf(): void
{
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(400);
        die('不正なリクエストです(CSRFトークンが一致しません)。ページを再読み込みしてやり直してください。');
    }
}

// ── ラベル定義 ─────────────────────────────

const PROJECT_STATUS_VALUES = ['ESTIMATING', 'NEGOTIATING', 'APPROVAL', 'ORDERED', 'LOST', 'COMPLETED'];
const PROJECT_STATUS_LABELS = [
    'ESTIMATING' => '見積',
    'NEGOTIATING' => '商談',
    'APPROVAL' => '稟議',
    'ORDERED' => '受注',
    'LOST' => '失注',
    'COMPLETED' => '完了',
];
const PROJECT_STATUS_BADGE_CLASS = [
    'ESTIMATING' => 'badge-outline',
    'NEGOTIATING' => 'badge-secondary',
    'APPROVAL' => 'badge-secondary',
    'ORDERED' => 'badge-default',
    'LOST' => 'badge-destructive',
    'COMPLETED' => 'badge-outline',
];

const TAX_TYPE_VALUES = ['EXCLUSIVE', 'INCLUSIVE'];
const TAX_TYPE_LABELS = [
    'EXCLUSIVE' => '外税',
    'INCLUSIVE' => '内税',
];

const ESTIMATE_STATUS_VALUES = ['DRAFT', 'FINALIZED'];
const ESTIMATE_STATUS_LABELS = [
    'DRAFT' => '下書き',
    'FINALIZED' => '確定',
];

function project_status_label(string $value): string
{
    return PROJECT_STATUS_LABELS[$value] ?? $value;
}

function tax_type_label(string $value): string
{
    return TAX_TYPE_LABELS[$value] ?? $value;
}

function estimate_status_label(string $value): string
{
    return ESTIMATE_STATUS_LABELS[$value] ?? $value;
}

/** 金額を「1,234円」の形式に整形する(マイナスも考慮) */
function format_yen($amount): string
{
    return number_format((float)$amount) . '円';
}

/** 日付文字列(Y-m-d)を表示用に整形。nullや空はダッシュ表示 */
function format_date($value): string
{
    if (empty($value)) {
        return '-';
    }
    return substr((string)$value, 0, 10);
}

/** POSTの値を取得(トリム済み)。存在しなければ空文字 */
function post_str(string $key): string
{
    return isset($_POST[$key]) ? trim((string)$_POST[$key]) : '';
}

function get_str(string $key): string
{
    return isset($_GET[$key]) ? trim((string)$_GET[$key]) : '';
}

// ── フォーム表示ヘルパー(値の再表示・エラーメッセージ表示) ─────────────────────────────

/** $values[$key] をエスケープして表示する(フォーム再表示用) */
function v(array $values, string $key): string
{
    return h($values[$key] ?? '');
}

/** $errors[$key] があれば<p class="error-text">として表示する */
function err(array $errors, string $key): string
{
    return isset($errors[$key]) ? '<p class="error-text">' . h($errors[$key]) . '</p>' : '';
}
