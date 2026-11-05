---
name: firestore-change
description: Firestore に保存するデータの構造を変えるときに使う。types/ の型にフィールドを追加・変更・削除したとき、app/repositories/ の読み書きを変えたとき、新しいコレクションやドキュメントを追加するときに読み込む。型 → 正規化 → repository → firestore.rules の順に変更し、チェックリストで漏れを確認する。メールアドレスなどの個人情報を保存しないこと。ルールのデプロイは deploy を使う。
---

# firestore-change

## データの場所

- `users/{uid}`：ユーザー情報（`authType`、`isGuest`、`createdAt`、`updatedAt`）
- `users/{uid}/projects/{projectId}`：プロジェクト（型は `types/project.ts` の `Project`。`workLogs` はサブコレクションに分けて保存する）
- `users/{uid}/projects/{projectId}/workLogs/{workLogId}`：作業ログ（`WorkLog`）
- `users/{uid}/settings/app`：設定（`types/settings.ts` の `AppSettings`）

## 手順

1. 変更内容（追加・変更・削除するフィールド、型、必須かどうか、最大値・最大長）を整理し、ユーザーに確認する。
2. 下の順に変更する。
   1. 型：`types/project.ts`、`types/settings.ts`
   2. 初期値・正規化：`app/utils/projectNormalize.ts`、`app/constants/defaultSettings.ts`（既存データにはフィールドがないため、読み込み時の初期値を決める）
   3. 読み書き：`app/repositories/`
   4. ルール：`firestore.rules`
   5. 画面・composables
3. チェックリストを確認する。
4. `npm run typecheck` と `npm run build` を実行する。

## チェックリスト

- [ ] 型と `firestore.rules` のフィールドが一致している
  - `hasOnlyKeys([...])` に追加・削除を反映した
  - 必須のフィールドは `hasRequiredKeys([...])` にも反映した
  - 値の型と範囲を検証している（`isString(value, 最大長)`、`isPositiveInt`、`isNonNegativeInt`、`isBoundedInt` など）
  - 任意のフィールドは `!request.resource.data.keys().hasAny([...]) || ...` の形で検証している
- [ ] 既存のデータ（新しいフィールドがない／古い形式）を読み込んでも壊れない
- [ ] repository 以外から Firestore を直接読み書きしていない
- [ ] 個人情報（メールアドレス、表示名、プロフィール画像のURLなど）を保存していない。ルールで許可するフィールドにも加えていない
- [ ] 新しいコレクションには `isSignedInUser(userId)` による本人だけのアクセス制限がある
- [ ] デプロイ順を決めた（フィールド追加はルール → アプリ、削除はアプリ → ルール。詳細は deploy）

## 注意点

- `firestore.rules` を変えずにデータ構造だけを変えない（CLAUDE.md のルール）。
- 既存ユーザーのデータを移行する処理は `utils/projectNormalize.ts` に書き、移行前後で値が変わらないかを確認する。
- `users/{uid}` のルールには、過去に保存していた `email` などのフィールドが残っている。新しい個人情報のフィールドを足す根拠にしない。
- ルールの変更が大きいときは firebase-security-rules-auditor でレビューする。
