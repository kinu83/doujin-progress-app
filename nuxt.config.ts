// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-30',

  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      firebaseAppCheckSiteKey: process.env.NUXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY,
    },
  },


  // CSPで 'unsafe-inline' を使わずに済むよう、インラインの importmap を出力しない。
  // 残るインラインスクリプトは scripts/externalize-inline-scripts.mjs で外部ファイルに移す。
  experimental: {
    entryImportMap: false,
  },

  css: ["~~/assets/css/main.css"],
  
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
