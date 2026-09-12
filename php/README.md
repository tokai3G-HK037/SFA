# SFM PHP版(WebARENA SuiteX向け)

Next.js版(リポジトリ直下のsrc/prisma等)と同じ業務要件をPHP + MySQLで再構築したものです。
このフォルダ(`php/`)の中身一式がそのままアップロード対象です。

## 機能

- ①案件管理(検索・絞り込み、エンドユーザー情報、仕入明細のCRUD・CSV一括取り込み)
- ②見積書(自動採番、明細のリアルタイム計算、下書き/確定ステータス)
- 自社情報設定
- ③データ出力は未実装(次のステップで着手予定。テーブルのみ作成済み)

## ローカルでの動作確認

1. PHP 8.1(またはSuiteXに近いバージョン)とMySQLをインストール
2. MySQLにデータベースを作成し、`schema.sql` を流し込む
   ```
   mysql -u root -e "CREATE DATABASE sfm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root sfm < schema.sql
   ```
3. `config.php.example` を `config.php` としてコピーし、接続情報を設定
4. `php.ini` で `pdo_mysql` 拡張が有効になっていることを確認(`;extension=pdo_mysql` の `;` を外す)
5. 組み込みサーバーで起動して確認
   ```
   php -S localhost:8000 -t .
   ```
   ブラウザで `http://localhost:8000/` を開く

## 本番(WebARENA SuiteX)へのデプロイ手順

1. WebARENAの管理画面で「標準データベース(MySQL)」を有効化し、接続情報(ホスト名・DB名・ユーザー名・パスワード)を控える
2. 付属の **phpMyAdmin** にログインし、「インポート」タブから `schema.sql` を実行してテーブルを作成
3. `config.php.example` を元に、控えた接続情報で `config.php` を作成
4. FTPクライアント(またはWebARENA管理画面のファイルマネージャー)で、`php/` フォルダの中身一式(`config.php`含む)を公開ディレクトリにアップロード(既存のホームページと分ける場合は次項を参照)
5. ブラウザでサイトを開き、案件登録→仕入明細→見積書作成の一連の流れを確認

## 既存のホームページと分けて、サブディレクトリに設置する場合

ドメイン直下(公開ディレクトリのトップ)がすでにホームページで使われている場合は、
`public_html/sfm/` のようなサブディレクトリにこのアプリだけを配置できます。

1. `php/` フォルダの中身一式を、公開ディレクトリ直下ではなく `sfm` などのサブディレクトリにアップロードする
   (例: `public_html/sfm/index.php`, `public_html/sfm/projects/index.php` ... となるように)
2. `config.php` の `BASE_PATH` を、サブディレクトリ名に合わせて設定する
   ```php
   define('BASE_PATH', '/sfm'); // 末尾に / は付けない
   ```
3. `https://ドメイン/sfm/` でアクセスできることを確認する

`BASE_PATH` を設定し忘れると、ナビゲーションのリンクやCSS・JSの読み込みがドメイン直下を指してしまい、
画面が崩れたりリンク切れになります。ドメイン直下に設置する場合は `BASE_PATH` を空文字のままにしてください。

## 制約・注意点

- SSH/Composerを使わない前提のため、外部ライブラリに依存しない素のPHP(PDOのみ)で実装しています
- PHP 8系構文は避け、PHP 7.4互換の書き方にしています(SuiteXの実際のPHPバージョンは管理画面でご確認ください)
- ログイン機能はありません(元のNext.js版と同じ方針)
- 見積書のPDF/Excel出力、③データ出力機能は未実装です
