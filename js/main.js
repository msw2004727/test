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
    console.log("main.js: DOM 元素引用已初始化到 GameState.elements");
}

// --- 主要應用初始化流程 ---
async function initializeApp() {
    console.log("main.js: Initializing application...");

    try {
        initializeDOMReferences();

        console.log("main.js: Firebase 應已初始化");

        const configs = await ApiClient.fetchGameConfigsAPI();
        GameState.gameSettings = configs;
        UI.populateNewbieGuide();
        console.log("main.js: 遊戲設定已載入");

        const preferredTheme = localStorage.getItem('theme') || 'dark';
        UI.applyTheme(preferredTheme);

        UI.createCombinationSlots();

        initializeStaticEventListeners();

        Auth.initializeAuthListener();

        if (GameState.elements.firstDnaFarmTab) {
            UI.openDnaFarmTab({ currentTarget: GameState.elements.firstDnaFarmTab }, 'dna-inventory-content');
        }

        UI.showAuthScreen();

        console.log("main.js: 初始化完成");
    } catch (error) {
        console.error("main.js: 初始化失敗", error);
    }
}

// 啟動應用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
