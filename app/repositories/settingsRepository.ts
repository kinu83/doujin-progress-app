import type { Firestore } from "firebase/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AppSettings } from "~/types/settings";

const userSettingsDoc = (db: Firestore, uid: string) => {
  return doc(db, "users", uid, "settings", "app");
};

const touchUser = async (db: Firestore, uid: string) => {
  await setDoc(
    doc(db, "users", uid),
    { updatedAt: new Date().toISOString() },
    { merge: true }
  );
};

export const loadRemoteSettings = async (db: Firestore, uid: string) => {
  const snapshot = await getDoc(userSettingsDoc(db, uid));
  if (!snapshot.exists()) return null;

  return snapshot.data() as Partial<AppSettings>;
};

export const saveRemoteSettings = async (
  db: Firestore,
  uid: string,
  settings: AppSettings
) => {
  await setDoc(
    userSettingsDoc(db, uid),
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  await touchUser(db, uid);
};
