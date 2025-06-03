// ui.js - 使用者介面與 DOM 操作模組

/**
 * 偽導入 - 在一個真正的模組化系統中，您會像這樣導入：
 * import * as GameState from './game-state.js'; // 遊戲狀態和 DOM 元素引用
 * // import * as GameLogic from './game-logic.js'; // 如果 UI 操作需要觸發遊戲邏輯
 * // import * as ApiClient from './api-client.js'; // 如果 UI 操作直接觸發 API
 */

// --- DOM 元素獲取 (理想情況下由 GameState 或專門的 elements.js 管理) ---
// 為了簡化，這裡假設 GameState.elements 包含所有需要的 DOM 引用
// 例如: GameState.elements.feedbackModal, GameState.elements.monsterImageElement 等

// --- 通用 UI 輔助函式 ---

export function openModal(modalId) {
    const modal = document.getElementById(modalId); // GameState.elements[modalId]
    if (modal) {
        modal.style.display = 'flex';
        console.log(`UI: Modal ${modalId} opened.`);
    } else {
        console.warn(`UI: Modal with id ${modalId} not found.`);
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId); // GameState.elements[modalId]
    if (modal) {
        modal.style.display = 'none';
        console.log(`UI: Modal ${modalId} closed.`);
    } else {
        console.warn(`UI: Modal with id ${modalId} not found.`);
    }
}

export function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modalElement => {
        if (modalElement && modalElement.id) {
            closeModal(modalElement.id);
        }
    });
    console.log("UI: All modals closed.");
}

export function showFeedbackModal(title, messageOrContent, showSpinner, showCloseXButton = true, showMonsterDetails = false, monsterForDetails = null) {
    const { feedbackModal, feedbackModalTitle, feedbackModalSpinner, feedbackModalCloseX, feedbackMonsterDetailsDiv, feedbackModalMessage } = GameState.elements; // 假設元素在 GameState 中

    if (!feedbackModalTitle || !feedbackModalSpinner || !feedbackModalCloseX || !feedbackMonsterDetailsDiv || !feedbackModalMessage) {
        console.error("UI: Feedback modal elements not found in GameState.elements.");
        return;
    }

    feedbackModalTitle.textContent = title;
    feedbackModalSpinner.style.display = showSpinner ? 'block' : 'none';
    feedbackModalCloseX.style.display = showCloseXButton ? 'block' : 'none';

    feedbackMonsterDetailsDiv.innerHTML = '';
    if (showMonsterDetails && monsterForDetails) {
        feedbackModalMessage.innerHTML = ""; // 清空一般訊息
        feedbackMonsterDetailsDiv.style.display = 'block';
        // ... (從 index.html 複製並調整渲染 monsterForDetails 的 HTML 結構的程式碼)
        // 例如:
        // const personalityObj = monsterForDetails.personality || {name: "未知", text: "個性資料不完整", color: "var(--text-secondary)"};
        // let elementCompHTML = monsterForDetails.elementComposition ? Object.entries(monsterForDetails.elementComposition)
        //     .map(([el, pc]) => `<span style="color:${getElementStyling(el).text}; font-weight:bold;">${el} ${pc}%</span>`)
        //     .join(', ') : "無";
        // feedbackMonsterDetailsDiv.innerHTML = `<h4>${monsterForDetails.nickname}</h4><p>屬性: ${elementCompHTML}</p>...`;
        console.log("UI: Feedback modal showing monster details for", monsterForDetails.nickname);
    } else {
        feedbackMonsterDetailsDiv.style.display = 'none';
        feedbackModalMessage.innerHTML = typeof messageOrContent === 'string' ? messageOrContent.replace(/\n/g, '<br>') : '';
        if (typeof messageOrContent !== 'string' && messageOrContent instanceof HTMLElement) {
             feedbackModalMessage.innerHTML = ''; // Clear previous messages
             feedbackModalMessage.appendChild(messageOrContent);
        }
    }
    openModal('feedback-modal');
}

export function applyTheme(theme) {
    const { themeIcon } = GameState.elements; // 假設元素在 GameState 中
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
    // updateMonsterSnapshotDisplay(GameState.currentMonster); // 確保在 GameState 可用後呼叫
    // populateInventory();
    // populateTemporaryBackpack();
    console.log(`UI: Theme applied - ${theme}. Snapshot and inventories might need refresh.`);
}

export function getContrastColor(hexColor) {
    const currentThemeIsLight = document.body.classList.contains('light-theme');
    if (!hexColor) {
        return currentThemeIsLight ? 'var(--text-primary-light)' : 'var(--text-primary-dark)';
    }
    // ... (完整的 getContrastColor 邏輯從 index.html 複製過來) ...
    let R, G, B;
    hexColor = hexColor.replace("#", "");
    if (hexColor.length === 3) { /* ... */ } else if (hexColor.length === 6) { /* ... */ } else { return currentThemeIsLight ? 'var(--text-primary-light)' : 'var(--text-primary-dark)'; }
    const yiq = (R * 299 + G * 587 + B * 114) / 1000;
    return yiq >= 128 ? (currentThemeIsLight ? '#000000' : '#FFFFFF' ): (currentThemeIsLight ? '#FFFFFF' : '#000000');
}

export function getElementStyling(elementType) {
    if (!elementType) elementType = '無';
    const typeKey = elementType.toLowerCase();
    // ... (完整的 getElementStyling 邏輯從 index.html 複製過來) ...
    // 返回 { text: 'var(...)', bg: 'var(...)' }
    // 範例:
    switch(typeKey) {
        case '火': return { text: 'var(--element-fire-text)', bg: 'var(--element-fire-bg)' };
        // ... 其他元素
        default: return { text: 'var(--element-mix-text)', bg: 'var(--element-mix-bg)' };
    }
}

export function getRarityStyling(rarityName) {
    // ... (完整的 getRarityStyling 邏輯從 index.html 複製過來, 可能依賴 getRarityData) ...
    // const rarityData = GameLogic.getRarityData(rarityName); // 假設 getRarityData 在 game-logic.js
    // return { text: `var(${rarityData.textVarKey || '--rarity-common-text'})` };
    // 簡化版:
    switch(rarityName) {
        case "稀有": return { text: 'var(--rarity-rare-text)'};
        // ... 其他稀有度
        default: return { text: 'var(--rarity-common-text)'};
    }
}


// --- 頁籤控制 ---
export function openGenericTab(evt, tabName, modalOrTabContainerId) {
    // ... (完整的 openGenericTab 邏輯從 index.html 複製過來) ...
    console.log(`UI: Opening generic tab ${tabName} in ${modalOrTabContainerId}`);
}

export function openDnaFarmTab(evt, tabName) {
    // ... (完整的 openDnaFarmTab 邏輯從 index.html 複製過來) ...
    console.log(`UI: Opening DNA/Farm tab ${tabName}`);
}

// --- 庫存與 DNA 顯示 ---
export function createDnaElement(item, index, sourceType) {
    // ... (完整的 createDnaElement 邏輯從 index.html 複製過來) ...
    // 這個函式會創建並返回一個 div 元素
    // 注意：它內部可能會綁定事件監聽器，這些監聽器應呼叫 game-logic.js 中的函式
    // 例如: slotDiv.addEventListener('dragstart', GameLogic.handleDragStart);
    // 例如: if (sourceType === 'temporary' && item) {
    //          slotDiv.onclick = () => GameLogic.moveFromTempToInventoryLogic(index);
    //       }
    const sD = document.createElement('div');
    sD.textContent = item ? item.name : '空位';
    // 更多樣式和屬性設定...
    console.log(`UI: Creating DNA element for ${sourceType} slot ${index}`);
    return sD;
}

export function populateInventory() {
    const { inventoryItemsContainer } = GameState.elements;
    if (!inventoryItemsContainer) { console.error("UI: inventoryItemsContainer not found!"); return; }
    inventoryItemsContainer.innerHTML = '';

    for (let i = 0; i < GameState.NUM_INVENTORY_SLOTS; i++) {
        const item = GameState.inventoryDisplaySlots[i];
        const slotDiv = createDnaElement(item, i, 'inventory');
        // slotDiv.addEventListener('dragstart', GameLogic.handleDragStart); // 綁定拖曳開始
        // slotDiv.addEventListener('drop', GameLogic.handleDrop); // 綁定放置
        // ... 其他事件
        inventoryItemsContainer.appendChild(slotDiv);
    }
    // 添加 "抽DNA" 按鈕和 "刪除區"
    // const drawDnaBtnElement = ... create ...
    // drawDnaBtnElement.addEventListener('click', GameLogic.handleDrawDnaButtonClickLogic);
    // inventoryItemsContainer.appendChild(drawDnaBtnElement);
    // const deleteSlotDiv = ... create ...
    // deleteSlotDiv.addEventListener('dragover', GameLogic.handleDragOver);
    // deleteSlotDiv.addEventListener('drop', GameLogic.handleDropOnDeleteSlotLogic);
    // inventoryItemsContainer.appendChild(deleteSlotDiv);
    console.log("UI: Inventory populated.");
}

export function populateTemporaryBackpack() {
    // ... (類似 populateInventory 的邏輯，遍歷 GameState.temporaryBackpackSlots) ...
    console.log("UI: Temporary backpack populated.");
}

export function updateCombinationSlotUI(comboSlotId, dnaItem) {
    // ... (更新指定組合槽的 UI，顯示 DNA 名稱、樣式等) ...
    console.log(`UI: Combination slot ${comboSlotId} UI updated.`);
}

export function clearCombinationSlotUI(comboSlotId) {
    // ... (清除指定組合槽的 UI，恢復為預設文字和樣式) ...
    console.log(`UI: Combination slot ${comboSlotId} UI cleared.`);
}

export function createCombinationSlots() {
    // ... (創建初始的 DNA 組合槽 UI) ...
    // GameState.elements.dnaCombinationSlotsContainer.innerHTML = '';
    // for (let i = 0; i < GameState.NUM_COMBINATION_SLOTS; i++) { /* ... create slot ... */ }
    console.log("UI: Combination slots created.");
}

// --- 怪獸相關 UI ---
export function updateMonsterSnapshotDisplay(monster) {
    const { monsterImageElement, snapshotAchievementTitle, snapshotNickname, snapshotWinLoss, snapshotEvaluation, monsterInfoButton } = GameState.elements;
    // ... (完整的 updateMonsterSnapshotDisplay 邏輯從 index.html 複製過來) ...
    // 會更新圖片、暱稱、評價等
    console.log("UI: Monster snapshot updated for", monster ? monster.nickname : "no monster");
}

export function renderMonsterInfoModalContent(monster) { // 新增的函式，專門處理渲染內容
    const { monsterInfoModalHeaderContent, monsterDetailsTab, monsterActivityLogsContainer } = GameState.elements;
    if (!monsterInfoModalHeaderContent || !monsterDetailsTab || !monsterActivityLogsContainer) return;
    if (!monster) { /* ... 處理無怪獸情況 ... */ return; }

    // ... (從 index.html 的 updateMonsterInfoModal 複製大部分渲染 HTML 的邏輯到這裡) ...
    // 例如: monsterInfoModalHeaderContent.innerHTML = `<div class="monster-info-name-styled">${monster.nickname}</div>`;
    // monsterDetailsTab.innerHTML = `...`;
    // updateMonsterActivityLog(monster); // 這個也應該是 UI 函式
    console.log(`UI: Rendering monster info modal content for ${monster.nickname}`);
}

export function updateMonsterInfoModal(monster) { // 這個函式現在主要協調，並處理 AI 描述的邏輯
    if (!monster) {
        renderMonsterInfoModalContent(null); // 呼叫渲染函式處理空狀態
        // UI.openGenericTab(null, 'monster-details-tab', 'monster-info-modal'); // 確保顯示預設頁籤
        return;
    }

    if (!monster.aiPersonality || !monster.aiIntroduction || !monster.aiEvaluation) {
        renderMonsterInfoModalContent(monster); // 先渲染基本資訊
        // GameLogic.generateAndStoreAIDescriptionsLogic(monster).then(updatedMonster => { // 從 game-logic.js 呼叫
        //     const currentModalMonsterName = GameState.elements.monsterInfoModalHeaderContent?.querySelector('.monster-info-name-styled')?.textContent;
        //     if (document.getElementById('monster-info-modal').style.display === 'flex' && currentModalMonsterName === updatedMonster.nickname) {
        //         renderMonsterInfoModalContent(updatedMonster); // AI 描述回來後再次渲染
        //     }
        // });
        console.log(`UI: Monster info for ${monster.nickname} displayed, AI description pending/being fetched by game-logic.`);
    } else {
        renderMonsterInfoModalContent(monster); // 直接渲染完整資訊
    }
    // UI.openGenericTab(null, 'monster-details-tab', 'monster-info-modal'); // 確保顯示預設頁籤
}


export function updateMonsterActivityLog(monster) {
    // ... (更新怪獸活動日誌的 UI) ...
    console.log(`UI: Monster activity log updated for ${monster.nickname}.`);
}


// --- 農場 UI ---
export function populateFarmList() {
    // ... (遍歷 GameState.farmedMonsters，為每個怪獸創建列表項並添加到 DOM) ...
    // 每個列表項的按鈕事件監聽器應呼叫 game-logic.js 中的函式
    // 例如: cultivateBtn.onclick = () => GameLogic.openCultivationSetupModalLogic(monster.id);
    console.log("UI: Farm list populated.");
}

export function updateFarmMonsterStatusDisplay(monster, statusDivElement) {
    // ... (根據怪獸的 farmStatus 更新其在農場列表中的狀態顯示) ...
    console.log(`UI: Farm monster status display updated for ${monster.nickname}.`);
}

// --- 修煉 UI ---
export function renderTrainingItems() {
    // ... (在修煉成果彈窗中渲染拾獲的物品列表) ...
    // 每個物品的 "加入背包" 按鈕應觸發 GameLogic.addToTemporaryBackpackLogic
    console.log("UI: Training items rendered.");
}

export function updateTrainingItemsDisplay() { // 用於在點擊"加入背包"後更新按鈕狀態
    // const { trainingItemsResult } = GameState.elements;
    // GameState.itemsFromCurrentTraining.forEach((item, index) => {
    //     const btn = trainingItemsResult?.querySelector(`.add-one-to-temp-backpack-btn[data-item-index="${index}"]`);
    //     if (btn && item.addedToBackpack) {
    //         btn.textContent = '已加入';
    //         btn.disabled = true;
    //     }
    // });
    console.log("UI: Training items display (button states) updated.");
}


// --- 排行榜 UI ---
export function setupMonsterLeaderboardTabs() {
    // ... (創建怪獸排行榜的元素頁籤按鈕) ...
    // 每個頁籤按鈕的點擊事件應觸發 populateMonsterLeaderboard
    console.log("UI: Monster leaderboard tabs setup.");
}
export function populateMonsterLeaderboard(filterElement = '所有') {
    // ... (獲取排序後的怪獸資料 - 可能來自 game-logic.js，然後渲染到表格) ...
    // "挑戰" 按鈕應觸發 GameLogic.promptChallengeMonsterLogic
    console.log(`UI: Monster leaderboard populated for element: ${filterElement}`);
}
export function populatePlayerLeaderboard() {
    // ... (獲取排序後的玩家資料 - 可能來自 game-logic.js，然後渲染到表格) ...
    console.log("UI: Player leaderboard populated.");
}

// --- 其他 UI ---
export function populateNewbieGuide(searchTerm = "") {
    // ... (根據搜尋詞過濾 GameState.newbieGuideData 並渲染到新手指南彈窗) ...
    console.log(`UI: Newbie guide populated/filtered with term: "${searchTerm}".`);
}

export function displaySearchedPlayers(playersToDisplay) {
    // ... (在好友列表彈窗中顯示搜尋到的玩家列表) ...
    // 每個玩家項目的點擊事件應觸發 GameLogic.showPlayerInfoPopupLogic
    console.log("UI: Searched players displayed.");
}
export function updateFriendsListContainerWithMessage(message, isError = false) {
    // const { friendsListContainer } = GameState.elements;
    // if (friendsListContainer) {
    //     friendsListContainer.innerHTML = `<p class="text-center text-base ${isError ? 'text-[var(--danger-color)]' : 'text-[var(--text-secondary)]'}">${message}</p>`;
    // }
    console.log(`UI: Friends list container message updated: "${message}", isError: ${isError}`);
}


export function openAndPopulatePlayerInfoModal(playerGameData, targetPlayerUid) {
    // ... (渲染玩家詳細資訊到玩家資訊彈窗) ...
    // openModal('player-info-modal');
    console.log(`UI: Player info modal populated and opened for UID: ${targetPlayerUid}.`);
}

export function displayBattleLog(logEntries) {
    // ... (將戰鬥日誌條目渲染到戰鬥日誌彈窗) ...
    // openModal('battle-log-modal');
    console.log("UI: Battle log displayed.");
}

export function renderDnaDrawResults(drawnDnaForModal) {
    // const { dnaDrawResultsGrid } = GameState.elements;
    // if (!dnaDrawResultsGrid) return;
    // dnaDrawResultsGrid.innerHTML = '';
    // if (drawnDnaForModal.length > 0) {
    //     drawnDnaForModal.forEach(dna => {
    //         const itemDiv = document.createElement('div');
    //         itemDiv.className = 'dna-draw-result-item';
    //         // ... 渲染 DNA 項目 HTML ...
    //         const addButton = itemDiv.querySelector('.add-drawn-to-temp-backpack-btn');
    //         if (addButton) {
    //             addButton.onclick = (e) => {
    //                 const dnaToAdd = JSON.parse(e.target.dataset.dna);
    //                 GameLogic.addToTemporaryBackpackLogic(dnaToAdd); // 呼叫 game-logic
    //                 e.target.textContent = '已加入';
    //                 e.target.disabled = true;
    //             };
    //         }
    //         dnaDrawResultsGrid.appendChild(itemDiv);
    //     });
    // } else {
    //     dnaDrawResultsGrid.innerHTML = '<p>未能抽到任何DNA...</p>';
    // }
    console.log("UI: DNA draw results rendered.");
}


export function showAuthScreen() {
    // GameState.elements.authScreen.style.display = 'flex';
    // GameState.elements.gameContainer.style.display = 'none';
    // closeAllModals(); // 確保所有彈窗關閉
    console.log("UI: Auth screen shown.");
}

export function showGameScreenAfterLogin() {
    // GameState.elements.authScreen.style.display = 'none';
    // GameState.elements.gameContainer.style.display = 'flex';
    // GameState.elements.gameContainer.style.flexDirection = 'column';
    // GameState.elements.gameContainer.style.alignItems = 'center';
    console.log("UI: Game screen shown after login.");
}

export function initializeInventoryDisplay() { // 這個函式協調其他 UI 函式
    // GameLogic.initializeInventoryDisplayLogic(); // 呼叫 game-logic 初始化資料
    // populateInventory();
    // populateTemporaryBackpack();
    console.log("UI: Inventory display initialized (called populate functions).");
}

export function updateMonsterInfoButtonState(currentMonster) {
    // const { monsterInfoButton } = GameState.elements;
    // if (monsterInfoButton) {
    //     monsterInfoButton.disabled = !currentMonster;
    //     if (currentMonster) {
    //         monsterInfoButton.onclick = () => {
    //             updateMonsterInfoModal(currentMonster); // 呼叫本檔案的函式
    //             openModal('monster-info-modal');
    //         };
    //     } else {
    //         monsterInfoButton.onclick = null;
    //     }
    // }
    console.log("UI: Monster info button state updated.");
}

export function updateActionButtonsStateUI() { // 純 UI 部分的按鈕狀態更新
    const { combineButton, monsterInfoButton } = GameState.elements;
    if (combineButton) {
        const hasItemsInCombination = GameState.combinationSlotsData.some(s => s !== null);
        combineButton.disabled = !hasItemsInCombination;
    }
    if (monsterInfoButton) {
         const isAnyMonsterBattling = GameState.farmedMonsters.some(m => m.farmStatus && m.farmStatus.isBattling);
         const monsterForInfo = isAnyMonsterBattling ? (GameState.battlingMonsterId ? GameState.farmedMonsters.find(m => m.id === GameState.battlingMonsterId) : GameState.currentMonster) : GameState.currentMonster; // 修正：即使無出戰也可能顯示當前怪獸
         monsterInfoButton.disabled = !monsterForInfo;
    }
    console.log("UI: Action buttons state updated.");
}

// 假設 GameState 和 ApiClient 已在某處定義並填充
// 這是為了讓此檔案中的函式能夠被靜態分析器或您自己更容易理解其依賴
const GameState = {
    elements: { /* ... DOM element references ... */ },
    gameSettings: { dnaFragments: [], rarities: {}, skills: {}, personalities: [], titles: [], healthConditions: [], newbieGuide: [], value_settings: { max_farm_slots: 10, max_monster_skills: 3 } },
    playerOwnedDNA: [],
    temporaryBackpackSlots: new Array(18).fill(null),
    inventoryDisplaySlots: new Array(10).fill(null),
    combinationSlotsData: new Array(5).fill(null),
    itemToDeleteInfo: null,
    currentLoggedInUser: null,
    farmedMonsters: [],
    MAX_FARM_SLOTS: 10,
    NUM_TEMP_BACKPACK_SLOTS: 18,
    NUM_INVENTORY_SLOTS: 10,
    NUM_COMBINATION_SLOTS: 5,
    currentMonster: null,
    battlingMonsterId: null,
    playerStats: { achievements: [] },
    itemsFromCurrentTraining: [],
    monsterToReleaseInfo: null,
    monsterToChallengeInfo: null,
    currentCultivationMonster: null,
    MAX_CULTIVATION_SECONDS: 999,
    newbieGuideData: [],
};

// 這些函式是 game-logic.js 中的，UI 事件處理器可能會呼叫它們
const GameLogic = {
    // handleDragStart: (e) => console.log("GL: Drag Start", e),
    // handleDrop: (e) => console.log("GL: Drop", e),
    // handleDropOnDeleteSlotLogic: (e) => console.log("GL: Drop on Delete", e),
    // handleDragOver: (e) => e.preventDefault(),
    // handleDragLeave: (e) => {},
    // handleComboSlotClickLogic: (e) => console.log("GL: Combo Slot Click", e),
    // moveFromTempToInventoryLogic: (index) => console.log("GL: Move from temp to inv", index),
    // handleDrawDnaButtonClickLogic: () => console.log("GL: Draw DNA Button Click"),
    // openCultivationSetupModalLogic: (id) => console.log("GL: Open Cultivation", id),
    // promptChallengeMonsterLogic: (monster) => console.log("GL: Prompt Challenge", monster),
    // showPlayerInfoPopupLogic: (uid) => console.log("GL: Show Player Popup", uid),
    // getRarityData: (rarityName) => ({ textVarKey: '--rarity-common-text'}), // 簡化
};
