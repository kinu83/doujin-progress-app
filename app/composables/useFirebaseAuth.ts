import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
} from "firebase/auth";

let authReadyPromise: Promise<User | null> | null = null;

export const useFirebaseAuth = () => {
  const user = useState<User | null>("firebase-user", () => null);
  const isAuthReady = useState("firebase-auth-ready", () => false);
  const authError = useState<string>("firebase-auth-error", () => "");

  const initAuth = () => {
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

  const ensureAuthenticated = async () => {
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

    const credential = await signInAnonymously($firebaseAuth);
    user.value = credential.user;
    isAuthReady.value = true;
    authReadyPromise = Promise.resolve(credential.user);

    return credential.user;
  };

  const signInWithGoogle = async () => {
    if (import.meta.server) return null;

    const { $firebaseAuth } = useNuxtApp();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const currentUser = await ensureAuthenticated();
      const credential = currentUser?.isAnonymous
        ? await linkWithPopup(currentUser, provider)
        : await signInWithPopup($firebaseAuth, provider);

      user.value = credential.user;
      isAuthReady.value = true;
      authError.value = "";
      authReadyPromise = Promise.resolve(credential.user);

      return credential.user;
    } catch (error) {
      const errorCode = typeof error === "object" && error && "code" in error
        ? String(error.code)
        : "";

      if (errorCode === "auth/credential-already-in-use") {
        const credential = await signInWithPopup($firebaseAuth, provider);
        user.value = credential.user;
        isAuthReady.value = true;
        authError.value = "";
        authReadyPromise = Promise.resolve(credential.user);

        return credential.user;
      }

      authError.value = error instanceof Error ? error.message : "Google ログインに失敗しました。";
      throw error;
    }
  };

  return {
    user,
    isAuthReady,
    authError,
    initAuth,
    ensureAuthenticated,
    signInWithGoogle,
  };
};
