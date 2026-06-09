import type { User, UserCredential } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  saveGoogleUserProfile,
  saveUsernameUserProfile,
} from "~/repositories/userRepository";

// 認証状態の初期確認が複数回実行されないよう、初回確認のPromiseを共有する。
let authReadyPromise: Promise<User | null> | null = null;

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{1,40}$/;

const usernameCredentials = (username: string) => {
  const identifier = username.trim().toLowerCase();

  return {
    identifier,
    email: `${identifier}@username.doujin-progress.invalid`,
    password: `username-login:${identifier}:doujin-progress-app`,
  };
};

const getFirebaseErrorCode = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
};

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

    // 未ログイン時に自動で匿名ログインせず、ログイン画面でユーザーに認証方法を選択させる。
    return null;
  };

  const ensureAuthenticated = async () => {
    return getCurrentUser();
  };

  // ユーザー名ログインは正式な認証ではなく、ポートフォリオ確認用のお試しログインとして扱う
  const signInWithUsername = async (username: string) => {
    // SSRではFirebase Authのブラウザ依存APIを実行できないため、ユーザー名認証もクライアント側だけで行う。
    if (import.meta.server) return null;

    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      authError.value = "ユーザー名を入力してください。";
      return null;
    }
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      authError.value = "ユーザー名は半角英数字・ハイフン・アンダースコアで40文字以内にしてください。";
      return null;
    }

    const { $firebaseAuth, $firestore } = useNuxtApp();
    const { email, password } = usernameCredentials(normalizedUsername);

    try {
      // 匿名認証は既存匿名ユーザーを再利用するため、ユーザー名ごとのuidを得られるメール/パスワード認証で代替する。
      let credential: UserCredential;
      try {
        credential = await signInWithEmailAndPassword($firebaseAuth, email, password);
      } catch (error) {
        const errorCode = getFirebaseErrorCode(error);
        if (!["auth/invalid-credential", "auth/user-not-found"].includes(errorCode)) {
          throw error;
        }
        credential = await createUserWithEmailAndPassword($firebaseAuth, email, password);
      }
      // ユーザー名認証はポートフォリオ確認用の簡易ログインとして扱う。
      // 正式公開時はGoogle認証のみを想定しているため、Googleアカウントへのデータ引き継ぎは行わない。
      completeSignIn(credential.user);
      saveUsernameUserProfile($firestore, credential.user, normalizedUsername).catch((error) => {
        console.warn("Failed to save username profile.", error);
      });

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
    signInWithUsername,
    signInWithGoogle,
    signOut,
  };
};
