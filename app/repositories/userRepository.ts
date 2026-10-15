import type { User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  deleteField,
  doc,
  setDoc,
} from "firebase/firestore";

const userDoc = (db: Firestore, uid: string) => {
  return doc(db, "users", uid);
};

export const saveGoogleUserProfile = async (db: Firestore, user: User) => {
  const ref = userDoc(db, user.uid);

  await setDoc(
    ref,
    {
      authType: "google",
      isGuest: false,
      // メールアドレス等のプロフィールはアプリで使わないため保存しない。過去に保存した値もここで削除する
      email: deleteField(),
      displayName: deleteField(),
      photoURL: deleteField(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};
