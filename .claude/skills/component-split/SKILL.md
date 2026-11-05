---
name: component-split
description: 画面やコンポーネントを分割・整理するリファクタのときに使う。「この画面をコンポーネントに分けて」「ページが長いので分割して」「ロジックを composables や utils に切り出して」と頼まれたとき、または1つの .vue ファイルが肥大化して分割を提案する段階になったときに読み込む。components/ui の共通部品を使い、props/emits/defineModel の書き方をそろえ、状態は composables・純粋関数は utils に分ける。動作は変えないこと。新しいデータ構造が絡む場合は firestore-change を使う。
---

# component-split

## 手順

1. 分割対象のファイルを読み、まとまりごとに「テンプレートの部品」「状態とロジック」「純粋な計算」に分けて分割案を作る。
2. 分割案（新しく作るファイルと、それぞれに移す内容）をユーザーに提示し、承認を得る。
3. 下の規約に沿って分割する。
4. `npm run typecheck` と `npm run build` を実行する。
5. 画面での確認が必要なら verify を使う。

## ファイルの置き場所

- `app/components/ui/`：画面に依存しない共通部品。分割の前に、まず既存の部品が使えないかを確認する。
  - `UiModal`（モーダルの外枠。Escで手前から閉じる、開いたときのフォーカス移動）
  - `UiConfirmDialog`（確認ダイアログ）
  - `UiCloseButton`、`UiBackLink`、`UiNumberStepper`（▲▼付きの数値入力）
- `app/components/<画面名>/`：その画面専用の部品（例：`calendar/`、`project/`、`settings/`）。
  - Nuxt の自動インポートにより、ディレクトリ名が接頭辞になる（`components/project/InfoEditDialog.vue` → `<ProjectInfoEditDialog>`）。ファイル名に画面名を重ねて書かない（`calendar/CalendarDayCell.vue` ではなく `calendar/DayCell.vue`）。
- `app/composables/useXxx.ts`：`ref`・`computed`・`watch` などの状態を持つロジック。
- `app/utils/`：状態を持たない純粋関数（計算、整形、正規化）。
- `app/constants/`：定数・初期設定。
- Firestore の読み書きは `app/repositories/` に集約する。コンポーネントや composables から直接 `firebase/firestore` を呼ばない。

## コンポーネントの書き方

- `<script setup lang="ts">` を使い、`<template>` を先、`<script>` を後に書く。
- props は型引数で書く。初期値が必要なら `withDefaults` を使う。

  ```ts
  const props = withDefaults(defineProps<{
    open: boolean;
    // 背景（外枠）のクラス
    overlayClass?: string;
  }>(), {
    overlayClass: "...",
  });
  ```

- emits は名前付きタプルの形式で書く。

  ```ts
  const emit = defineEmits<{
    save: [input: ProjectInfoInput];
    cancel: [];
  }>();
  ```

- 親と双方向に値をやり取りするもの（選択中のタブ、入力値など）は `defineModel` を使う。
- 型は `~~/types/` から、composables・utils・constants は `~/` からインポートする。
- コメントは日本語で、「なぜそうしているか」が分からない箇所にだけ書く。

## 注意点

- 動作を変えない。移動したロジックの中身は、必要な変更（`export` の追加、引数化など）以外は書き換えない。
- 特に `utils/projectNormalize.ts` のような旧データの移行処理は既存ユーザーのデータに影響するため、移動だけにとどめる。
- 1回の PR で分割する範囲は1画面までにする。
- コミットの種別は `refactor`。
