import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInAnonymously,
  signInWithPopup,
} from "firebase/auth";
import {
  saveGoogleUserProfile,
  saveUsernameUserProfile,
} from "~/repositories/userRepository";

let authReadyPromise: Promise<User | null> | null = null;

export const useFirebaseAuth = () => {
  const user = useState<User | null>("firebase-user", () => null);
  const isAuthReady = useState("firebase-auth-ready", () => false);
  const authError = useState<string>("firebase-auth-error", () => "");

  const initAuth = () => {
    // SSRではFirebase Authのブラウザ依存APIを実行できないため、クライアント側だけで認証状態を確認する。
    if (import.meta.server) return Promise.resolve(null);
    if (authReadyPromise) return authReadyPromise;

    const { $firebaseAuth } = useNuxtApp();

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

    // 未ログイン時に自動で匿名ログインせず、ログイン画面でユーザーに認証方法を選択させる。
    return null;
  };

  const ensureAuthenticated = async () => {
    return getCurrentUser();
  };

  const signInWithUsername = async (username: string) => {
    // SSRではFirebase Authのブラウザ依存APIを実行できないため、匿名認証もクライアント側だけで行う。
    if (import.meta.server) return null;

    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      authError.value = "ユーザー名を入力してください。";
      return null;
    }

    const { $firebaseAuth, $firestore } = useNuxtApp();

    try {
      // Firebase Authenticationにはユーザー名のみの認証がないため、匿名認証をお試し用の土台として使う。
      const credential = await signInAnonymously($firebaseAuth);
      // ユーザー名認証はポートフォリオ確認用の簡易ログインとして扱う。
      // 正式公開時はGoogle認証のみを想定しているため、Googleアカウントへのデータ引き継ぎは行わない。
      await saveUsernameUserProfile($firestore, credential.user, normalizedUsername);

      user.value = credential.user;
      isAuthReady.value = true;
      authError.value = "";
      authReadyPromise = Promise.resolve(credential.user);

      return credential.user;
    } catch (error) {
      authError.value = error instanceof Error ? error.message : "お試し利用の開始に失敗しました。";
      throw error;
    }
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
      await saveGoogleUserProfile($firestore, credential.user);

      user.value = credential.user;
      isAuthReady.value = true;
      authError.value = "";
      authReadyPromise = Promise.resolve(credential.user);

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
    signInWithUsername,
    signInWithGoogle,
    signOut,
  };
};
