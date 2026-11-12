# CLAUDE.md

同人原稿進捗管理アプリ「修羅場メーター」の開発ルール。ページ数・工程ごとの作業時間・締切から、残り作業時間と修羅場レベルを算出する Web アプリ。

## 技術スタック

- Nuxt 4 / Vue 3 / TypeScript / Tailwind CSS 4
- Firebase Authentication（Googleログインのみ）/ Cloud Firestore / Firebase Hosting

## コマンド

- 開発サーバー: `npm run dev`
- ビルド: `npm run build`
- 型チェック: `npm run typecheck`
- 静的生成（Hosting用）: `npm run generate`（出力先 `.output/public`、`dist` はそのシンボリックリンク）

## ディレクトリ構成

- `app/pages/` 画面
- `app/components/` UIコンポーネント
- `app/composables/` 状態・ロジック（`useXxx.ts`）
- `app/repositories/` Firestoreへの読み書き（Firestoreアクセスはここに集約する）
- `app/utils/` 表示用の純粋関数
- `app/constants/` 定数・初期設定
- `firestore.rules` セキュリティルール
- `.claude/skills/` Skill（`firebase-*` は外部から取得し `skills-lock.json` で管理、それ以外はこのリポジトリ用）

## 常に守ること

- データ構造を変えたら `firestore.rules` も合わせて更新する。
- ユーザーのメールアドレスなどの個人情報を Firestore に保存しない（プライバシーポリシーとの整合のため）。
- `.env` は秘密情報を含むため、読まない・コミットしない。

## コミット・PR・Issue

- `commit`・`pr`・`issue` の Skill に従う。コミット・push・PR 作成は承認なしで実行してよい。Issue の作成・編集は実行前に内容を見せて承認を得る。
