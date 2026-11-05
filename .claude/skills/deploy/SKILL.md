---
name: deploy
description: 本番環境（Firebase Hosting・Firestore ルール）へデプロイするときに使う。「デプロイして」「本番に反映して」「ルールだけデプロイして」と頼まれたとき、または main にマージした変更を公開する段階になったときに読み込む。対象（hosting／firestore:rules／indexes）を確認し、ユーザーの承認を得てから firebase deploy --only で実行する。本番のユーザーに影響するため、承認は毎回取ること。データ構造を変えたときはルールとアプリのデプロイ順に注意する（詳細は firestore-change）。
---

# deploy

本番のプロジェクトは `.firebaserc` の `default`（`shuraba-mater`）。

## 手順

1. `git status` と `git log origin/main..HEAD` を確認する。原則として main にマージ済みの状態からデプロイする。それ以外のブランチからデプロイする場合はユーザーに確認する。
2. `firebase use` で対象のプロジェクトを確認する。
3. 何をデプロイするかを決める。
   - アプリ：`firebase deploy --only hosting`（`firebase.json` の predeploy で `npm run generate` が自動で実行され、`.output/public` がアップロードされる）
   - ルールだけ：`firebase deploy --only firestore:rules`
   - インデックス：`firebase deploy --only firestore:indexes`
4. デプロイ前に確認する。
   - アプリ：`npm run typecheck` が成功すること
   - ルール：`firestore.rules` の差分を見て、意図しない許可の追加がないこと（必要なら firebase-security-rules-auditor を使う）
5. 実行するコマンドと対象をユーザーに見せ、承認を得てから実行する。
6. 結果（Hosting の URL、エラーの有無）を報告する。

## デプロイ順

- データにフィールドを追加するとき：ルール → アプリ の順。先にアプリを出すと、新しいフィールドを含む書き込みがルールで拒否される。
- データからフィールドを削除するとき：アプリ → ルール の順。先にルールを出すと、古いアプリからの書き込みが拒否される。

## 注意点

- 必ず `--only` で対象を指定する。`firebase deploy` だけで全部をデプロイしない。
- デプロイの実行前に、必ず承認を得る。承認は1回ごとに取る。
- デプロイすると `.firebase/hosting.*.cache` が更新される。機能の変更と同じコミットに入れず、扱いはユーザーに確認する。
