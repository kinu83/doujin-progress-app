import type { User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const userDoc = (db: Firestore, uid: string) => {
  return doc(db, "users", uid);
};

export const saveUsernameUserProfile = async (
  db: Firestore,
  user: User,
  username: string
) => {
  const ref = userDoc(db, user.uid);
  const snapshot = await getDoc(ref);

  await setDoc(
    ref,
    {
      username,
      authType: "username",
      isGuest: true,
      createdAt: snapshot.exists() ? snapshot.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const saveGoogleUserProfile = async (db: Firestore, user: User) => {
  const ref = userDoc(db, user.uid);
  const snapshot = await getDoc(ref);

  await setDoc(
    ref,
    {
      authType: "google",
      isGuest: false,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: snapshot.exists() ? snapshot.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
