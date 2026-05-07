import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
  ];
  const missingKey = requiredEntries.find(([, value]) => !value)?.[0];

  if (missingKey) {
    throw new Error(`Missing Firebase runtime config: ${missingKey}`);
  }

  const app = initializeApp(firebaseConfig);

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: getAuth(app),
      firestore: getFirestore(app),
    },
  };
});
