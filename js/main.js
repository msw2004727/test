// main.js - 正式模組整合版

import { GameState } from './game-state.js';
import * as ApiClient from './api-client.js';
import * as UI from './ui.js';
import * as Auth from './auth.js';
import * as EventHandlers from './event-handlers.js';

function initializeDOMReferences() {
    GameState.elements.themeSwitcherBtn = document.getElementById('theme-switcher');
    GameState.elements.authScreen = document.getElementById('auth-screen');
    GameState.elements.gameContainer = document.getElementById('game-container');
    GameState.elements.dnaCombinationSlotsContainer = document.getElementById('dna-combination-slots');
    GameState.elements.firstDnaFarmTab = document.querySelector('#dna-farm-tabs .tab-button');
    console.log("main.js: DOM 元素引用已初始化到 GameState.elements");
}

async function initializeApp() {
    console.log("main.js: Initializing application...");
    initializeDOMReferences();

    try {
        const configs = await ApiClient.fetchGameConfigsAPI();
        GameState.gameSettings = configs;
        console.log("main.js: Game configs fetched and stored in GameState.");
        UI.populateNewbieGuide();
    } catch (error) {
        console.error("main.js: Failed to fetch initial game configs.", error);
    }

    const preferredTheme = localStorage.getItem('theme') || 'dark';
    UI.applyTheme(preferredTheme);
    UI.createCombinationSlots();
    EventHandlers.initializeStaticEventListeners();
    Auth.initializeAuthListener();

    if (GameState.elements.firstDnaFarmTab) {
        UI.openDnaFarmTab({ currentTarget: GameState.elements.firstDnaFarmTab }, 'dna-inventory-content');
    }

    UI.showAuthScreen();
    console.log("main.js: Application initialization complete.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
