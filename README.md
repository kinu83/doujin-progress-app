# 修羅場メーター

同人誌・漫画原稿の進捗、締切、作業予定、実績時間をまとめて管理する Nuxt アプリです。  
ページごとの進み具合と工程別の作業時間から、残り作業時間、今日必要な作業時間、締切までの「修羅場レベル」を自動で計算します。

## できること

- 原稿プロジェクトの作成、編集、削除
- イベント名、作業開始日、イベント日、入稿締切日の管理
- ページごとの進捗ステータス更新
- 工程ごとの作業時間をもとにした進捗率、残り作業時間、必要作業時間の計算
- 必要作業時間に応じた修羅場レベル表示
- カレンダーでの日別予定、実績作業時間の確認と入力
- ページ進捗更新に連動した作業ログ記録
- 本文仕様、印刷会社、部数、予算などの本づくりメモ
- 作業工程テンプレート、初期ページ数、修羅場メーターしきい値の設定
- Firebase Authentication による匿名ログイン、Google アカウント連携
- Cloud Firestore へのプロジェクト、設定、作業ログ保存

## 技術スタック

- Nuxt 4
- Vue 3
- Tailwind CSS 4
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

## セットアップ

依存関係をインストールします。

```bash
npm install
```

Firebase の公開設定を `.env` に用意します。  
このアプリはクライアント起動時に Firebase を初期化するため、少なくとも `NUXT_PUBLIC_FIREBASE_API_KEY`、`NUXT_PUBLIC_FIREBASE_PROJECT_ID`、`NUXT_PUBLIC_FIREBASE_APP_ID` が必要です。

```bash
NUXT_PUBLIC_FIREBASE_API_KEY=...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NUXT_PUBLIC_FIREBASE_PROJECT_ID=...
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NUXT_PUBLIC_FIREBASE_APP_ID=...
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

開発サーバーを起動します。

```bash
npm run dev
```

## スクリプト

```bash
npm run dev       # 開発サーバーを起動
npm run build     # 本番ビルド
npm run generate  # 静的生成
npm run preview   # ビルド結果をプレビュー
```

## 画面構成

- `/`  
  プロジェクト一覧。進捗率、残り日数、今日の必要時間、修羅場レベルを確認できます。
- `/projects/new`  
  新しい原稿プロジェクトを作成します。
- `/projects/[id]`  
  プロジェクト詳細。ページ別進捗、本の情報、作業ログを管理します。
- `/calendar`  
  月ごとの予定と実績作業時間を確認し、日別の作業時間を入力します。
- `/settings`  
  作業工程、初期ページ数、修羅場メーターのしきい値を設定します。

## Firebase

Firestore のデータは Firebase Authentication のユーザーごとに分離しています。

```text
users/{uid}
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/workLogs/{workLogId}
users/{uid}/settings/app
```

セキュリティルールは `firestore.rules` で管理しています。  
プロジェクト、作業ログ、設定のスキーマ検証を含み、自分の `uid` 配下のデータだけを読み書きできる構成です。

Firebase Hosting は `.output/public` を配信対象にしています。

## データ保存

アプリはクライアント側で動作します。プロジェクトと設定はブラウザの `localStorage` に保存され、Firebase 認証済みのユーザーでは Firestore にも保存されます。

初回利用時は匿名ログインで利用できます。あとから Google アカウントに連携すると、同じ Firebase ユーザーとしてデータを引き継げます。

## 主なディレクトリ

```text
app/pages/          画面
app/composables/    状態管理とアプリロジック
app/repositories/   Firestore 保存処理
app/utils/          表示・計算の補助関数
app/constants/      初期設定
types/              型定義
public/             静的ファイル
```
