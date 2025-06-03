// main.js - 應用程式主進入點與協調器

/**
 * 偽導入 - 在一個真正的模組化系統中，您會像這樣導入：
 * import { auth, db, firebase } from './firebase-config.js'; // Firebase 實例已在此模組中初始化
 * import * as GameState from './game-state.js'; // 遊戲狀態和 DOM 元素引用
 * import * as UI from './ui.js'; // UI 操作函式
 * import * as GameLogic from './game-logic.js'; // 遊戲邏輯函式
 * import * as ApiClient from './api-client.js'; // API 呼叫函式
 * import * as Auth from './auth.js'; // 使用者驗證函式
 * import { initializeStaticEventListeners } from './event-handlers.js'; // 事件處理註冊
 */

// --- DOM 元素獲取與初始化 (通常在應用程式啟動早期執行) ---
// 這裡假設 GameState 模組會處理 DOM 元素的獲取和儲存
function initializeDOMReferences() {
    // 範例：實際中這些會被 GameState.js 或類似模組管理
    GameState.elements.themeSwitcherBtn = document.getElementById('theme-switcher');
    GameState.elements.authScreen = document.getElementById('auth-screen');
    GameState.elements.gameContainer = document.getElementById('game-container');
    GameState.elements.dnaCombinationSlotsContainer = document.getElementById('dna-combination-slots');
    GameState.elements.firstDnaFarmTab = document.querySelector('#dna-farm-tabs .tab-button');
    // ... 獲取所有其他在 initializeApp 中會用到的 DOM 元素
    console.log("main.js: DOM 元素引用已（概念上）初始化到 GameState.elements");
}


// --- 主要應用程式初始化函式 ---
async function initializeApp() {
    console.log("main.js: Initializing application...");

    // 0. (假設) 初始化 DOM 元素引用 (實際應由 GameState 或專用模組處理)
    initializeDOMReferences(); // 確保 GameState.elements 可用

    // 1. 初始化 Firebase (firebase-config.js 已經在導入時執行了 firebase.initializeApp)
    // 我們需要確保 auth 和 db 實例已從 firebase-config.js 正確導出並在此可用。
    // 例如: const { auth, db } = await import('./firebase-config.js');
    // GameState.auth = auth; GameState.db = db; // 將實例存儲到 GameState (如果需要全域訪問)
    console.log("main.js: Firebase should be initialized by importing firebase-config.js");

    // 2. 獲取遊戲核心設定
    try {
        const configs = await ApiClient.fetchGameConfigsAPI(); // 來自 api-client.js
        GameState.gameSettings = configs; // 更新全域遊戲設定
        // GameLogic.initializeNpcMonsters(); // 如果 NPC 初始化依賴 gameSettings
        console.log("main.js: Game configs fetched and stored in GameState.");
        UI.populateNewbieGuide(); // 使用獲取的設定填充新手指南 (來自 ui.js)
    } catch (error) {
        console.error("main.js: Failed to fetch initial game configs. Using defaults.", error);
        // UI.showFeedbackModal("錯誤", "無法載入遊戲核心設定，部分功能可能異常。", false, true, false);
        // GameState.gameSettings 會保留其預設值（如果在 game-state.js 中有定義）
        // GameLogic.initializeNpcMonsters(); // 即使設定失敗，也嘗試用預設值初始化NPC
    }

    // 3. 應用初始主題
    const preferredTheme = localStorage.getItem('theme') || 'dark';
    UI.applyTheme(preferredTheme); // 來自 ui.js
    console.log("main.js: Initial theme applied.");

    // 4. 初始化 UI 元件 (例如組合槽)
    UI.createCombinationSlots(); // 來自 ui.js
    console.log("main.js: Initial UI components (like DNA slots) created.");

    // 5. 註冊靜態事件監聽器
    EventHandlers.initializeStaticEventListeners(); // 來自 event-handlers.js
    console.log("main.js: Static event listeners initialized.");

    // 6. 更新操作按鈕的初始狀態
    // UI.updateActionButtonsStateUI(); // 來自 ui.js (可能依賴 GameState)
    console.log("main.js: Initial state of action buttons updated.");


    // 7. 初始化 Firebase 驗證狀態監聽器
    Auth.initializeAuthListener(); // 來自 auth.js
    console.log("main.js: Firebase auth listener initialized.");
    // initializeAuthListener 內部會根據登入狀態決定是顯示 authScreen 還是嘗試載入遊戲資料

    // 8. 設定初始顯示的頁籤 (如果需要)
    if (GameState.elements.firstDnaFarmTab) {
        UI.openDnaFarmTab({ currentTarget: GameState.elements.firstDnaFarmTab }, 'dna-inventory-content'); // 來自 ui.js
        console.log("main.js: Initial tab display set.");
    }

    // 9. 初始時，總是先嘗試顯示驗證畫面 (Point 2 的要求)
    // initializeAuthListener 中的邏輯會處理後續是否切換到遊戲畫面
    UI.showAuthScreen(); // 來自 ui.js
    console.log("main.js: Auth screen shown initially as per requirement.");

    console.log("main.js: Application initialization complete.");
}

// --- 啟動應用程式 ---
// 確保在 DOM 完全載入後執行，或者因為是 ES6 模組，通常會自動延遲執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

const ApiClient = {
    fetchGameConfigsAPI: async () => {
        console.log("ApiClient.fetchGameConfigsAPI (mock) called");
        // 模擬 API 呼叫延遲和返回
        await new Promise(resolve => setTimeout(resolve, 100));
        return { /* 模擬的遊戲設定 */
            dna_fragments: [], rarities: {}, skills: {}, personalities: [], titles: ["新手"],
            health_conditions: [], newbie_guide: [{title: "歡迎 (預設)", content: "..."}],
            value_settings: { max_farm_slots: 10, max_monster_skills: 3, max_battle_turns: 30 },
            npc_monsters: [],
            // ... 其他必要的預設設定鍵
        };
    }
};

const UI = {
    applyTheme: (theme) => console.log(`UI.applyTheme: ${theme}`),
    createCombinationSlots: () => console.log("UI.createCombinationSlots called"),
    populateNewbieGuide: () => console.log("UI.populateNewbieGuide called"),
    openDnaFarmTab: (evt, tabName) => console.log(`UI.openDnaFarmTab: ${tabName}`),
    showAuthScreen: () => {
        if(GameState.elements.authScreen) GameState.elements.authScreen.style.display = 'flex';
        if(GameState.elements.gameContainer) GameState.elements.gameContainer.style.display = 'none';
        console.log("UI.showAuthScreen called (mock)");
    },
    // updateActionButtonsStateUI: () => console.log("UI.updateActionButtonsStateUI called"),
    // showFeedbackModal: (title, msg) => console.log(`UI.showFeedbackModal: ${title} - ${msg}`),
};

const Auth = {
    initializeAuthListener: () => console.log("Auth.initializeAuthListener called")
};

const EventHandlers = {
    initializeStaticEventListeners: () => console.log("EventHandlers.initializeStaticEventListeners called")
};

const GameLogic = {
    // initializeNpcMonsters: () => console.log("GameLogic.initializeNpcMonsters called")
};

// 模擬 firebase-config.js 的導入效果 (實際應透過 import)
// import { auth as firebaseAuth, db as firebaseDb, firebase as firebaseNamespace } from './firebase-config.js';
// GameState.auth = firebaseAuth;
// GameState.db = firebaseDb;
// window.firebase = firebaseNamespace; // 如果其他地方全域依賴 firebase
console.log("main.js: Mock imports and GameState setup for conceptual demonstration.");

