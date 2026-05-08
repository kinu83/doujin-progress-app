# 同人原稿進捗管理アプリ

同人誌・漫画原稿の締切、ページ別進捗、日別の作業予定と実績をまとめて管理する Nuxt アプリです。

ページごとの作業工程から残作業時間を計算し、締切までに必要な1日あたりの作業量や「修羅場レベル」を表示します。データはブラウザの `localStorage` に保存しつつ、Firebase Authentication と Cloud Firestore による同期にも対応しています。

## 主な機能

- プロジェクト作成、編集、削除
- イベント名、作業開始日、イベント日、締切日の管理
- 総ページ数とページごとの進捗ステータス管理
- 作業工程ごとの所要時間を使った進捗率、残作業時間、必要作業時間の計算
- 締切状況に応じた修羅場レベル表示
- 日別カレンダーでの作業予定、実績入力
- ページ進捗更新に連動した作業ログ記録
- 手入力の実績作業時間管理
- 本文仕様、印刷会社、部数、予算などの本づくりメモ
- 作業工程テンプレートの追加、編集、削除、既定工程の設定
- 匿名ログインと Google アカウント連携
- Firestore へのプロジェクト、設定、作業ログ保存

## 使用技術

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

## 利用できるスクリプト

```bash
npm run dev       # 開発サーバーを起動
npm run build     # 本番ビルド
npm run generate  # 静的生成
npm run preview   # ビルド結果をプレビュー
```

## Firebase

Firestore のデータはユーザーごとに分離されています。

```text
users/{uid}
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/workLogs/{workLogId}
users/{uid}/settings/app
```

セキュリティルールは `firestore.rules` で管理しています。プロジェクト、作業ログ、設定のスキーマ検証を含み、自分の `uid` 配下のデータだけを読み書きできます。

Firebase Hosting は `.output/public` を配信対象にしています。

## データ保存の方針

アプリはクライアント側で動作します。プロジェクトと設定はまず `localStorage` に保存され、Firebase 認証済みのユーザーでは Firestore にも保存されます。

匿名ユーザーでも利用でき、あとから Google アカウントに連携すると同じ Firebase ユーザーとしてデータを継続できます。
