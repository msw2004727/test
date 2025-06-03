// firebase-config.js - 修正版

// ✅ 確保這些 CDN 已在 index.html 載入：
// firebase-app.js、firebase-auth.js、firebase-firestore.js

// ✅ 檢查 firebase 是否已載入
if (typeof firebase === 'undefined') {
    throw new Error("❌ Firebase SDK 未載入。請確認 index.html 已正確引入 CDN。")
}

// ✅ 初始化設定
const firebaseConfig = {
    apiKey: "AIzaSyCACjjC1S-9gj6hKCyfAedzH9kTf_JZwDE",
    authDomain: "aigame-fb578.firebaseapp.com",
    projectId: "aigame-fb578",
    storageBucket: "aigame-fb578.appspot.com",
    messagingSenderId: "932095431807",
    appId: "1:932095431807:web:28aab493c770166102db4a"
};

// ✅ 初始化 Firebase App（只執行一次）
if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase 初始化完成");
} else {
    console.log("ℹ️ Firebase 已初始化，略過重複初始化");
}

// ✅ 匯出 auth 與 db（避免使用 export firebase 造成 module 衝突）
const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
