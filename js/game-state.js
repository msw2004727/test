// game-state.js
// 全域狀態集中管理，給所有模組匯入用

const GameState = {
    elements: { /* DOM 元素引用將在此處 */
        themeSwitcherBtn: null, authScreen: null, gameContainer: null,
        dnaCombinationSlotsContainer: null, firstDnaFarmTab: null,
        // ... 其他元素
    },
    gameSettings: {}, // 將由 fetchGameConfigsAPI 填充
    // ... 其他需要的 game state 屬性
    auth: null, // 將由 firebase-config.js 導入的 auth 實例賦值
    db: null,   // 將由 firebase-config.js 導入的 db 實例賦值
};

export { GameState };