# 見積書機能の拡張(Excelテンプレート出力・PDF出力・添付ファイル保管)

## Context

現状の見積書機能は①画面上での作成(Webフォーム)のみに対応している。ユーザーから、
②仕入明細をもとにしたExcelテンプレート出力による見積書作成、③完成した見積書を
Excel/PDFとして保管・閲覧できるようにしたい、という要望があった。

ヒアリングの結果、②のExcelで作成した内容(品名・数量・単価等)を**システムへ再取り込みする
必要はなく**、完成したExcel/PDFファイルをそのまま保存・閲覧できれば十分と確認できた。
これにより、以下の3機能を追加する方針とする。SSH/Composerが使えない制約は従来通りのため、
外部ライブラリはComposerを使わず単一ファイルを直接リポジトリに取り込む形で対応する。

1. **仕入明細のExcelテンプレート出力**: 案件の仕入明細(仕入先・品目・数量・単価)を、
   見積書作成のたたき台となるExcelファイルに出力する。販売単価・金額は空欄にしておき、
   ユーザーがExcel上で見積書を完成させる。
2. **見積書のPDF出力**: ①画面上で作成した見積書を、その場でPDFとしてダウンロードできる
   ようにする(DBの内容から都度生成。保存は不要)。
3. **添付ファイルの保管・閲覧**: ②で完成させたExcel、または①のPDF等、完成した見積書
   ファイルを見積書レコードに添付・保管し、詳細画面からいつでもダウンロード・閲覧できる
   ようにする。

## 技術方針

- **Excel出力**: 外部ライブラリなしで確実に動く「HTMLテーブルを`.xls`拡張子・
  `application/vnd.ms-excel`で出力する」方式を採用する(Excelがそのまま開ける、
  枯れた手法)。真の`.xlsx`(OOXML)生成は複雑なため見送る。
- **PDF出力**: 単一ファイルで動く枯れたライブラリ **FPDF**(Composer不要、ファイルを
  直接配置するだけ)を`includes/vendor/fpdf/`にベンダリングする。FPDF単体は日本語
  (Unicode)に対応していないため、UTF-8/TrueType対応版の **tFPDF**(FPDFの拡張、
  同じく単一ファイル追加で使える)と、無償の日本語TrueTypeフォント(Noto Sans JP等、
  OFLライセンス)を`includes/vendor/fpdf/font/`に同梱して埋め込む。
  外部ネットワークへの疎通は確認済み(GitHub上のFPDFソースをダウンロード可能)。
- **添付ファイル保管**: `estimates`テーブルに添付ファイル情報のカラムを追加し、
  実ファイルは`php/uploads/estimates/`配下にUUIDベースのファイル名で保存する
  (拡張子は`.xlsx`/`.xls`/`.pdf`のみ許可。元のファイル名は表示用にDBへ別途保持)。
  この用途で見積明細の入力を必須にする理由はないため、明細0件でも見積書を保存できる
  よう既存のバリデーションを緩和する(添付ファイルだけで見積書を成立させたいケースに対応)。

## データベース変更

`estimates`テーブルに以下を追加(`schema.sql`にも反映し、本番DBには`ALTER TABLE`で追加):

```sql
ALTER TABLE estimates
  ADD COLUMN attachment_path VARCHAR(500) NULL,
  ADD COLUMN attachment_original_name VARCHAR(255) NULL,
  ADD COLUMN attachment_mime VARCHAR(100) NULL,
  ADD COLUMN attachment_uploaded_at DATETIME NULL;
```

## 実装ファイル

- `php/includes/vendor/fpdf/` — FPDF本体・tFPDF拡張・日本語フォントを配置(新規)
- `php/includes/estimate_pdf.php` — 見積書データからPDFを組み立てる関数
  (`estimates/view.php`のプレビューレイアウトを踏襲: 見積番号/発行者/宛先/明細表/
  小計・税・合計)
- `php/estimates/pdf.php` — 上記を呼び出しPDFをダウンロードさせるエンドポイント
  (`?id=`で対象の見積書を指定)
- `php/projects/purchase_items_excel.php` — 案件の仕入明細をExcelテンプレートとして
  出力するエンドポイント(`?project_id=`で対象案件を指定)。列: 仕入先/品目/数量/単位/
  仕入単価/仕入金額(実データ)+ 販売単価/金額(空欄、Excel上で入力)
- `php/estimates/attachment_upload.php` — 添付ファイルのアップロード処理(POST、
  拡張子ホワイトリスト・CSRF・サイズ上限チェック)
- `php/uploads/estimates/` — アップロード先ディレクトリ(実行時に自動作成。中身は
  `.gitignore`対象、`.gitkeep`で空フォルダのみ管理)
- 更新: `php/projects/view.php`(仕入明細セクションに「Excelテンプレート出力」ボタン追加)
- 更新: `php/estimates/view.php`(「PDFをダウンロード」ボタン、添付ファイルの表示/
  アップロードフォームを追加)
- 更新: `php/includes/validation.php`(`validate_estimate`の明細1件以上必須チェックを削除)
- 更新: `php/schema.sql`(estimatesテーブルにattachment_*カラムを追加)

## 実装順序

1. FPDF/tFPDF/日本語フォントをダウンロードし`includes/vendor/fpdf/`に配置、動作確認用の
   最小PDF生成テスト(日本語が正しく表示されるか)を行う
2. `estimate_pdf.php`(PDF組み立て)と`estimates/pdf.php`(ダウンロード)を実装し、
   `estimates/view.php`にボタンを追加
3. `purchase_items_excel.php`(Excelテンプレート出力)を実装し、`projects/view.php`に
   ボタンを追加
4. `estimates`テーブルへのカラム追加(ローカルDB・schema.sql)、`attachment_upload.php`
   実装、`estimates/view.php`に添付ファイルの表示・アップロードUIを追加
5. `validate_estimate`の明細必須チェックを緩和
6. ローカルで一連の動作を確認(下記)

## 検証方法

- 仕入明細のある案件でExcelテンプレートを出力し、内容(品目・数量・仕入金額等)が
  正しく含まれているか確認する
- 既存の見積書でPDFをダウンロードし、Readツールで内容を開いて日本語が文字化けせず
  正しくレイアウトされているか目視確認する
- 見積書詳細画面からExcel/PDFファイルをアップロードし、添付ファイルとして表示・
  ダウンロードできることを確認する
- 明細0件・添付ファイルのみの見積書が保存できることを確認する
- 型/構文チェック(`php -l`)を全PHPファイルに対して実行する
- 最終的に本番DBへの`ALTER TABLE`実行手順と、更新ファイルのアップロード手順を
  ユーザーに案内する
