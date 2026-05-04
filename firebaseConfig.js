import { initializeApp } from "~/app";
import { getFirestore } from "firebase/firestore"; // 例: データベースを使いたい場合
import { getAuth } from "firebase/auth";           // 例: ログイン機能を使いたい場合

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "doufin-progress-app.firebaseapp.com",
  projectId: "doufin-progress-app",
  storageBucket: "doufin-progress-app.firebasestorage.app",
  messagingSenderId: "112535167556",
  appId: "1:112535167556:web:367af19e1bb3dd73621211",
  measurementId: "G-EKS7DJWQLR"
};

// 初期化
const app = initializeApp(firebaseConfig);

// 他のファイルで使えるようにエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);