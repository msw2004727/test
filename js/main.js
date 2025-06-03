// main.js - 應用程式主進入點與協調器

// 實際導入所有必要的模組
import { auth, db, firebaseApp } from './firebase-config.js'; // Firebase 實例已在此模組中初始化並導出
import * as GameState from './game-state.js'; // 遊戲狀態和 DOM 元素引用
import * as UI from './ui.js'; // UI 操作函式
import * as GameLogic from './game-logic.js'; // 遊戲邏輯函式
import * as ApiClient from './api-client.js'; // API 呼叫函式
import * as Auth from './auth.js'; // 使用者驗證函式
import { initializeStaticEventListeners } from './event-handlers.js'; // 事件處理註冊

// --- DOM 元素獲取與初始化 (通常在應用程式啟動早期執行) ---
// 這裡假設 GameState 模組會處理 DOM 元素的獲取和儲存。
// 此函數僅為確保 GameState.elements 被填充，實際獲取邏輯應在 GameState 內部。
function initializeDOMReferences() {
    // 範例：實際中這些會被 GameState.js 或類似模組管理
    // 確保 GameState.elements 物件存在
    if (!GameState.elements) {
        GameState.elements = {};
    }

    // 獲取所有在應用程式啟動時需要直接引用的 DOM 元素
    GameState.elements.themeSwitcherBtn = document.getElementById('theme-switcher');
    GameState.elements.authScreen = document.getElementById('auth-screen');
    GameState.elements.gameContainer = document.getElementById('game-container');
    GameState.elements.dnaCombinationSlotsContainer = document.getElementById('dna-combination-slots');
    GameState.elements.firstDnaFarmTab = document.querySelector('#dna-farm-tabs .tab-button');
    // 您可以根據需要在 GameState.js 中添加更多 DOM 元素引用，並在該模組中處理它們的獲取。
    // 例如：
    // GameState.elements.loginNicknameInput = document.getElementById('login-nickname');
    // GameState.elements.loginPasswordInput = document.getElementById('login-password');
    // ... 等等

    console.log("main.js: DOM 元素引用已初始化到 GameState.elements");
}


// --- 主要應用程式初始化函式 ---
async function initializeApp() {
    console.log("main.js: Initializing application...");

    // 0. 初始化 DOM 元素引用
    initializeDOMReferences(); // 確保 GameState.elements 可用

    // 1. 初始化 Firebase 實例並存儲到 GameState
    // firebase-config.js 已經在導入時執行了 firebase.initializeApp
    // 我們需要確保 auth 和 db 實例已從 firebase-config.js 正確導出並在此可用。
    GameState.auth = auth;
    GameState.db = db;
    GameState.firebaseApp = firebaseApp; // 如果其他地方需要 firebase app 實例
    console.log("main.js: Firebase 實例已存儲到 GameState。");

    // 2. 獲取遊戲核心設定
    try {
        const configs = await ApiClient.fetchGameConfigsAPI(); // 來自 api-client.js
        GameState.gameSettings = configs; // 更新全域遊戲設定
        GameLogic.initializeNpcMonsters(); // 如果 NPC 初始化依賴 gameSettings，則在此呼叫
        console.log("main.js: 遊戲設定已獲取並存儲到 GameState。");
        UI.populateNewbieGuide(); // 使用獲取的設定填充新手指南 (來自 ui.js)
    } catch (error) {
        console.error("main.js: 無法載入初始遊戲設定。使用預設值。", error);
        UI.showFeedbackModal("錯誤", "無法載入遊戲核心設定，部分功能可能異常。", false, true, false);
        // GameState.gameSettings 會保留其預設值（如果在 game-state.js 中有定義）
        GameLogic.initializeNpcMonsters(); // 即使設定失敗，也嘗試用預設值初始化NPC
    }

    // 3. 應用初始主題
    const preferredTheme = localStorage.getItem('theme') || 'dark';
    UI.applyTheme(preferredTheme); // 來自 ui.js
    console.log("main.js: 初始主題已應用。");

    // 4. 初始化 UI 元件 (例如組合槽)
    UI.createCombinationSlots(); // 來自 ui.js
    console.log("main.js: 初始 UI 元件 (如 DNA 槽) 已創建。");

    // 5. 註冊靜態事件監聽器
    initializeStaticEventListeners(); // 來自 event-handlers.js
    console.log("main.js: 靜態事件監聽器已初始化。");

    // 6. 更新操作按鈕的初始狀態
    UI.updateActionButtonsStateUI(); // 來自 ui.js (可能依賴 GameState)
    console.log("main.js: 操作按鈕的初始狀態已更新。");

    // 7. 初始化 Firebase 驗證狀態監聽器
    // initializeAuthListener 內部會根據登入狀態決定是顯示 authScreen 還是嘗試載入遊戲資料
    Auth.initializeAuthListener(); // 來自 auth.js
    console.log("main.js: Firebase 驗證監聽器已初始化。");


    // 8. 設定初始顯示的頁籤 (如果需要)
    if (GameState.elements.firstDnaFarmTab) {
        // 模擬點擊第一個頁籤，以確保其內容被正確顯示和初始化
        UI.openDnaFarmTab({ currentTarget: GameState.elements.firstDnaFarmTab }, 'dna-inventory-content'); // 來自 ui.js
        console.log("main.js: 初始頁籤顯示已設定。");
    }

    // 9. 初始時，總是先嘗試顯示驗證畫面
    // initializeAuthListener 中的邏輯會處理後續是否切換到遊戲畫面
    UI.showAuthScreen(); // 來自 ui.js
    console.log("main.js: 驗證畫面已初始顯示。");

    console.log("main.js: 應用程式初始化完成。");
}

// --- 啟動應用程式 ---
// 確保在 DOM 完全載入後執行，或者因為是 ES6 模組，通常會自動延遲執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
