import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
} from "firebase/auth";
import { saveGoogleUserProfile } from "~/repositories/userRepository";

// 認証状態の初期確認が複数回実行されないよう、初回確認のPromiseを共有する。
let authReadyPromise: Promise<User | null> | null = null;

export const useFirebaseAuth = () => {
  const user = useState<User | null>("firebase-user", () => null);
  const isAuthReady = useState("firebase-auth-ready", () => false);
  const authError = useState<string>("firebase-auth-error", () => "");

  const completeSignIn = (currentUser: User) => {
    user.value = currentUser;
    isAuthReady.value = true;
    authError.value = "";
    authReadyPromise = Promise.resolve(currentUser);
  };

  const initAuth = () => {
    // SSRではFirebase Authのブラウザ依存APIを実行できないため、クライアント側だけで認証状態を確認する。
    if (import.meta.server) return Promise.resolve(null);
    if (authReadyPromise) return authReadyPromise;

    const { $firebaseAuth } = useNuxtApp();
    // Firebaseに保存されているログイン状態を確認し、ブラウザ更新後もユーザー情報を復元する。
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(
        $firebaseAuth,
        (currentUser) => {
          user.value = currentUser;
          isAuthReady.value = true;
          unsubscribe();
          resolve(currentUser);
        },
        (error) => {
          authError.value = error.message;
          isAuthReady.value = true;
          unsubscribe();
          resolve(null);
        }
      );
    });

    return authReadyPromise;
  };

  const getCurrentUser = async () => {
    // SSRではFirebase Authのブラウザ依存APIを実行できないため、現在ユーザーの参照もクライアント側に限定する。
    if (import.meta.server) return null;
    if (user.value) return user.value;

    const { $firebaseAuth } = useNuxtApp();
    if ($firebaseAuth.currentUser) {
      user.value = $firebaseAuth.currentUser;
      isAuthReady.value = true;
      authReadyPromise = Promise.resolve($firebaseAuth.currentUser);

      return $firebaseAuth.currentUser;
    }

    const currentUser = await initAuth();
    if (currentUser) return currentUser;

    // 未ログイン時に自動で匿名ログインせず、ログイン画面でGoogleログインを促す。
    return null;
  };

  const ensureAuthenticated = async () => {
    return getCurrentUser();
  };

  const signInWithGoogle = async () => {
    // SSRではFirebase Authのブラウザ依存APIを実行できないため、Google認証もクライアント側だけで行う。
    if (import.meta.server) return null;

    const { $firebaseAuth, $firestore } = useNuxtApp();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const credential = await signInWithPopup($firebaseAuth, provider);
      completeSignIn(credential.user);
      saveGoogleUserProfile($firestore, credential.user).catch((error) => {
        console.warn("Failed to save Google profile.", error);
      });

      return credential.user;
    } catch (error) {
      authError.value = error instanceof Error ? error.message : "Google ログインに失敗しました。";
      throw error;
    }
  };

  const signOut = async () => {
    if (import.meta.server) return;

    const { $firebaseAuth } = useNuxtApp();
    await firebaseSignOut($firebaseAuth);
    user.value = null;
    isAuthReady.value = true;
    authError.value = "";
    authReadyPromise = Promise.resolve(null);
  };

  return {
    user,
    isAuthReady,
    authError,
    initAuth,
    getCurrentUser,
    ensureAuthenticated,
    signInWithGoogle,
    signOut,
  };
};
