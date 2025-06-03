// firebase-config.js - Firebase 初始化與配置模組

// Firebase SDK 已在 index.html 中透過 CDN 引入:
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

// --- Firebase 配置物件 ---
// 請確保這些值是正確的，並且與您 Firebase 專案的設定一致。
// 這些值通常是公開的，用於前端初始化。
const firebaseConfig = {
    apiKey: "AIzaSyCACjjC1S-9gj6hKCyfAedzH9kTf_JZwDE", // 這是您在 index.html 中提供的金鑰
    authDomain: "aigame-fb578.firebaseapp.com",
    projectId: "aigame-fb578",
    storageBucket: "aigame-fb578.appspot.com",
    messagingSenderId: "932095431807",
    appId: "1:932095431807:web:28aab493c770166102db4a"
};

// --- 初始化 Firebase 應用 ---
// 檢查 firebase 物件是否存在，以確保 SDK 已載入
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase app initialized from firebase-config.js");
} else {
    console.error("Firebase SDK not loaded. Ensure firebase-app.js is included in your HTML before this script.");
}

// --- 導出 Firebase 服務實例 ---
// 再次檢查 firebase 物件是否存在，以避免在 SDK 未載入時出錯
const auth = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth() : null;
const db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;

if (!auth) {
    console.error("Firebase Authentication service (auth) could not be initialized. Ensure firebase-auth.js is loaded.");
}
if (!db) {
    console.error("Firebase Firestore service (db) could not be initialized. Ensure firebase-firestore.js is loaded.");
}

// 導出 auth, db 和 firebase 命名空間 (用於 FieldValue 等)
export { auth, db, firebase };
