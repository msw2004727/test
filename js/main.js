// main.js - 應用主進入點與協調器

import { GameState } from './game-state.js';
import * as UI from './ui.js';
import * as Auth from './auth.js';
import * as ApiClient from './api-client.js';
import * as GameLogic from './game-logic.js';
import { initializeStaticEventListeners } from './event-handlers.js';

// --- DOM 元素獲取與初始化 ---
function initializeDOMReferences() {
    GameState.elements.themeSwitcherBtn = document.getElementById('theme-switcher');
    GameState.elements.authScreen = document.getElementById('auth-screen');
    GameState.elements.gameContainer = document.getElementById('game-container');
    GameState.elements.dnaCombinationSlotsContainer = document.getElementById('dna-combination-slots');
    GameState.elements.firstDnaFarmTab = document.querySelector('#dna-farm-tabs .tab-button');
    // 可依需求繼續補其他 DOM 元素
    console.log("main.js: DOM 元素引用已初始化到 GameState.elements");
}

// --- 主要應用初始化流程 ---
async function initializeApp() {
    console.log("main.js: Initializing application...");

    // 1. 初始化 DOM 元素
    initializeDOMReferences();

    // 2. Firebase 應已透過 firebase-config.js 初始化
    console.log("main.js: Firebase 應已初始化");

    // 3. 取得遊戲設定
    try {
        const configs = await ApiClient.fetchGameConfigsAPI();
        GameState.gameSettings = configs;
        UI.populateNewbieGuide();
        console.log("main.js: 遊戲設定已載入");
    } catch (error) {
        console.error("main.js: 無法取得遊戲設定", error);
    }

    // 4. 應用主題
    const preferredTheme = localStorage.getItem('theme') || 'dark';
    UI.applyTheme(preferredTheme);

    // 5. 建立組合槽 UI
    UI.createCombinationSlots();

    // 6. 綁定靜態事件
    initializeStaticEventListeners();

    // 7. Firebase 驗證監聽
    Auth.initializeAuthListener();

    // 8. 顯示初始頁籤
    if (GameState.elements.firstDnaFarmTab) {
        UI.openDnaFarmTab({ currentTarget: GameState.elements.firstDnaFarmTab }, 'dna-inventory-content');
    }

    // 9. 初始畫面顯示登入頁面
    UI.showAuthScreen();

    console.log("main.js: 初始化完成");
}

// 啟動應用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
