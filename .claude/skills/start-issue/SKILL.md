---
name: start-issue
description: Issue に取りかかるときに使う。「#46 をやって」「Issue 46 を実装して」「このIssueに着手して」のように Issue 番号を指定して作業を頼まれたときに読み込む。Issue の内容と関連 Issue・コードを読み、origin/main から feature/機能名 のブランチを作り、実装方針を提示するところまで行う。方針の承認を得るまで実装は始めないこと。Issue の作成・編集は issue を使う。
---

# start-issue

## 手順

1. `gh issue view <番号>` で Issue を読む。本文で紐付いている Issue・PR があれば、それも読む。
2. `git status` で作業ツリーを確認する。未コミットの変更がある場合は、ブランチを切り替える前にユーザーにどうするか確認する（勝手に stash・破棄しない）。
3. `git fetch` してから、`origin/main` を元にブランチを作る。
   - `git switch -c feature/<機能名> origin/main`
   - `<機能名>` は Issue の内容を表す英語の kebab-case（例：`feature/dev-skills`、`feature/calendar-components`）。
4. Issue の「設計方針」「最終的な成果物」に関係するコードを読む。
5. 実装方針をユーザーに提示する。
   - 変更・追加するファイル
   - 各ファイルで何をするか
   - Issue に書かれていないが必要そうなこと、Issue と実際のコードで食い違っている点
   - 動作確認の方法
6. 方針の承認を得てから実装を始める。

## 注意点

- このSkillの範囲は「ブランチを作って方針を提示する」まで。承認前に実装を始めない。
- Issue の内容を変えたほうがよさそうな場合は、issue Skill を使って更新を提案する。
- 実装中にデータ構造を変える場合は firestore-change、コンポーネントを分割する場合は component-split も使う。
