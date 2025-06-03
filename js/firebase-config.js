// firebase-config.js - 修正版

// 導入 Firebase 模組化 SDK 的必要函式
import { initializeApp } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";

// 初始化設定
const firebaseConfig = {
    apiKey: "AIzaSyCACjjC1S-9gj6hKCyfAedzH9kTf_JZwDE",
    authDomain: "aigame-fb578.firebaseapp.com",
    projectId: "aigame-fb578",
    storageBucket: "aigame-fb578.appspot.com",
    messagingSenderId: "932095431807",
    appId: "1:932095431807:web:28aab493c770166102db4a"
};

// 初始化 Firebase App（只執行一次）
// 這裡使用一個全局變數來檢查是否已初始化，以防止在某些環境下重複初始化
let firebaseApp;
if (!window._firebaseAppInstance) { // 使用一個全局變數來儲存實例
    firebaseApp = initializeApp(firebaseConfig);
    window._firebaseAppInstance = firebaseApp; // 儲存實例
    console.log("✅ Firebase 初始化完成");
} else {
    firebaseApp = window._firebaseAppInstance;
    console.log("ℹ️ Firebase 已初始化，略過重複初始化");
}

// 獲取並匯出 auth 與 db 實例
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db };
