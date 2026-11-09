import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

declare global {
  // App Checkのデバッグトークンを使うためのFirebase SDKのグローバル変数。
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | undefined;
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId,
  };

  const requiredEntries = [
    ["firebaseApiKey", firebaseConfig.apiKey],
    ["firebaseProjectId", firebaseConfig.projectId],
    ["firebaseAppId", firebaseConfig.appId],
    ["firebaseAppCheckSiteKey", config.public.firebaseAppCheckSiteKey],
  ];
  const missingKey = requiredEntries.find(([, value]) => !value)?.[0];

  if (missingKey) {
    throw new Error(`Missing Firebase runtime config: ${missingKey}`);
  }

  const app = initializeApp(firebaseConfig);

  // 開発環境ではreCAPTCHAを通せないため、SDKがブラウザのコンソールに出すデバッグトークンをFirebaseコンソールに登録して使う。
  // 本番ビルドに含めないよう、トークンの値は設定に持たせない。
  if (import.meta.dev) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Firestoreへのリクエストにトークンを付けるため、getFirestoreより前に初期化する。
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(config.public.firebaseAppCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: getAuth(app),
      firestore: getFirestore(app),
    },
  };
});
