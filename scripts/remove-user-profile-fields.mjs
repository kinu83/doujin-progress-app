// users/{uid} に過去に保存していた個人情報（email・displayName・photoURL）を一括で削除する。
//
// 使い方:
//   node scripts/remove-user-profile-fields.mjs           対象のドキュメント数を表示するだけ（書き込まない）
//   node scripts/remove-user-profile-fields.mjs --apply   実際に削除する
//
// 認証はアプリケーションのデフォルト認証情報（ADC）を使う。
//   - gcloud がある場合: gcloud auth application-default login
//   - ない場合: サービスアカウントの鍵をリポジトリの外に置き、GOOGLE_APPLICATION_CREDENTIALS にそのパスを設定する
// FIRESTORE_EMULATOR_HOST を設定すると、本番ではなくエミュレータに対して実行する。
//
// ルールが email 等を許可しなくなると、値が残っているユーザーは書き込みが拒否される。
// そのため、ルールをデプロイする前にこのスクリプトを --apply で実行すること。

import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

const PROFILE_FIELDS = ["email", "displayName", "photoURL"];
const BATCH_SIZE = 400;

const apply = process.argv.includes("--apply");
const projectId =
  process.env.GCLOUD_PROJECT ??
  JSON.parse(readFileSync(new URL("../.firebaserc", import.meta.url), "utf8")).projects.default;

initializeApp(
  process.env.FIRESTORE_EMULATOR_HOST
    ? { projectId }
    : { projectId, credential: applicationDefault() }
);

const db = getFirestore();
const target = process.env.FIRESTORE_EMULATOR_HOST
  ? `エミュレータ（${process.env.FIRESTORE_EMULATOR_HOST}）`
  : `本番（${projectId}）`;

console.log(`対象: ${target}`);
console.log(apply ? "モード: 削除する（--apply）" : "モード: 確認のみ（--apply を付けると削除する）");

const snapshot = await db.collection("users").get();
const targets = snapshot.docs.filter((doc) => {
  const data = doc.data();
  return PROFILE_FIELDS.some((field) => field in data);
});

// 値そのものは個人情報のため出力しない。フィールド名ごとの件数だけを表示する
for (const field of PROFILE_FIELDS) {
  const count = targets.filter((doc) => field in doc.data()).length;
  console.log(`  ${field}: ${count}件`);
}
console.log(`users ${snapshot.size}件のうち、削除対象は ${targets.length}件`);

if (!apply || targets.length === 0) {
  process.exit(0);
}

const deletes = Object.fromEntries(PROFILE_FIELDS.map((field) => [field, FieldValue.delete()]));

for (let i = 0; i < targets.length; i += BATCH_SIZE) {
  const batch = db.batch();
  for (const doc of targets.slice(i, i + BATCH_SIZE)) {
    batch.update(doc.ref, deletes);
  }
  await batch.commit();
}

console.log(`${targets.length}件から削除しました`);
