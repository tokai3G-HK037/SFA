# SFM

社内向けの案件管理・見積書・売上仕入データ出力システムです。

- ①案件管理: 顧客・案件情報のCRUD、仕入明細の複数行管理
- ②見積書の作成と保存: Phase 2で実装予定
- ③売上/仕入データ出力: Phase 3で実装予定(社内販売管理システムへの取り込み用CSV/Excel)

計画の詳細は `C:\Users\ws000\.claude\plans\generic-prancing-sutton.md` を参照してください。

## 技術スタック

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui(Base UI)
- React Hook Form + Zod
- TanStack Query
- Prisma 7 + PostgreSQL

## セットアップ

```bash
npm install

# ローカル開発用のPostgreSQLを起動(Docker不要。停止するまでバックグラウンドで動き続けます)
npx prisma dev -d

# .env の DATABASE_URL を `npx prisma dev` が出力する接続文字列に合わせて設定
# (localhost ではなく 127.0.0.1 を使うこと。IPv6解決によるECONNREFUSEDを避けるため)

npx prisma migrate dev

npm run dev
```

http://localhost:3000 を開いて確認します。

### よく使うコマンド

```bash
npx prisma dev ls        # ローカルPostgresサーバーの状態確認
npx prisma studio         # データをGUIで確認
npx prisma migrate dev --name <name>   # スキーマ変更を反映
npx next typegen          # ルートの型(PageProps/RouteContext)を再生成
npm run lint               # ESLint
npx tsc --noEmit           # 型チェック
npm run build               # 本番ビルド
```

## 注意事項(Next.js 16 / Prisma 7 / shadcn base-nova を使用)

このプロジェクトは執筆時点でリリース直後のメジャーバージョンを採用しています。学習データにある知識と異なる可能性があるため、実装前に以下を確認してください。

- Next.js: `node_modules/next/dist/docs/` 配下の同梱ドキュメントを参照(`params`/`searchParams` は非同期、`next lint` は廃止など)
- Prisma: `prisma-client` ジェネレータ(出力先 `src/generated/prisma`)を使用しており、`PrismaClient` の初期化には `@prisma/adapter-pg` などのドライバーアダプタが必須(旧来の `new PrismaClient()` だけでは動作しない)。`.claude/skills/` にPrisma公式のリファレンススキルが同梱されています。
- shadcn/ui: `components.json` の `style` は `base-nova`。Radixではなく `@base-ui/react` ベースで、`asChild` は使えず `render={<Link href="..." />}` プロパティを使う。`form` コンポーネントは廃止され `field` プリミティブに置き換わっている。
