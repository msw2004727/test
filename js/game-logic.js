// game-logic.js

/**
 * Placeholder imports - in a real modular system, you'd import these:
 * import { auth, db, firebase } from './firebase-config.js';
 * import * as ApiClient from './api-client.js';
 * import * as GameState from './game-state.js'; // For accessing and mutating game state variables
 * import {
 * showFeedbackModal, openModal, closeModal,
 * populateTemporaryBackpack, populateInventory, populateFarmList,
 * updateMonsterSnapshotDisplay, updateMonsterInfoModal, displayBattleLog,
 * renderTrainingItems, getElementStyling, getContrastColor,
 * createCombinationSlots, updateFarmMonsterStatusDisplay,
 * openAndPopulatePlayerInfoModal, displaySearchedPlayers,
 * initializeInventoryDisplay, updateMonsterActivityLog
 * } from './ui.js';
 * // DOM elements would ideally be managed by ui.js or passed as parameters,
 * // or accessed via GameState.elements
 */

// --- DNA and Inventory Logic ---

// Placeholder for game state variables that would be imported from game-state.js
// let {
//     gameSettings, playerOwnedDNA, temporaryBackpackSlots, inventoryDisplaySlots,
//     combinationSlotsData, itemToDeleteInfo, currentLoggedInUser, farmedMonsters,
//     MAX_FARM_SLOTS, currentMonster, battlingMonsterId, playerStats,
//     itemsFromCurrentTraining, monsterToReleaseInfo, monsterToChallengeInfo,
//     currentCultivationMonster, MAX_CULTIVATION_SECONDS, API_BASE_URL, // API_BASE_URL from api-client.js
//     // DOM Elements (ideally not directly accessed here)
//     dnaDrawResultsGrid, confirmationModalBodyEl, releaseMonsterImagePlaceholder,
//     confirmationModalTitleEl, confirmActionBtn, cultivationMonsterName, maxCultivationTimeSpan,
//     trainingResultsModalTitle, trainingStoryResult, trainingGrowthResult, addAllToTempBackpackBtn,
//     trainingItemsResult, friendsListContainer, snapshotNickname, monsterInfoButton,
//     farmedMonstersListContainer, // And many others...
// } = GameState;


// This function would call functions from ui.js to update the DOM
function updateAllUIDisplays() {
    // populateInventory();
    // populateTemporaryBackpack();
    // populateFarmList();
    // updateMonsterSnapshotDisplay(GameState.currentMonster);
    // updateActionButtonsState();
    console.log("Placeholder: Call UI update functions");
}

// This function would call functions from ui.js or game-logic.js itself
function updateActionButtonsState() {
    // const hasItemsInCombination = GameState.combinationSlotsData.some(s => s !== null);
    // if (GameState.elements.combineButton) GameState.elements.combineButton.disabled = !hasItemsInCombination;
    // const isAnyMonsterBattling = GameState.farmedMonsters.some(m => m.farmStatus && m.farmStatus.isBattling);
    // const monsterForInfo = isAnyMonsterBattling ? (GameState.battlingMonsterId ? GameState.farmedMonsters.find(m => m.id === GameState.battlingMonsterId) : GameState.currentMonster) : null;
    // if (GameState.elements.monsterInfoButton) GameState.elements.monsterInfoButton.disabled = !monsterForInfo;
    console.log("Placeholder: Update action buttons state");
}


export function handleDrawDnaButtonClick() {
    console.log("抽DNA按鈕被點擊 (V19) - from game-logic.js");
    const drawnDnaForModal = [];
    if (GameState.gameSettings.dnaFragments && GameState.gameSettings.dnaFragments.length > 0) {
        const drawableDna = GameState.gameSettings.dnaFragments.filter(
            f => f.rarity === "普通" || f.rarity === "稀有"
        );
        if (drawableDna.length > 0) {
            for (let i = 0; i < 6; i++) {
                const randomDnaTemplate = drawableDna[Math.floor(Math.random() * drawableDna.length)];
                const newDnaInstance = JSON.parse(JSON.stringify(randomDnaTemplate));
                newDnaInstance.tempId = `drawn_${Date.now()}_${i}`;
                drawnDnaForModal.push(newDnaInstance);
            }
        } else {
             console.warn("沒有可抽取的普通或稀有等級DNA。");
        }
    }

    // This part would interact with ui.js to render the modal
    // if (GameState.elements.dnaDrawResultsGrid) {
    //     GameState.elements.dnaDrawResultsGrid.innerHTML = '';
    //     if (drawnDnaForModal.length > 0) {
    //         drawnDnaForModal.forEach(dna => {
    //             const itemDiv = document.createElement('div');
    //             /* ... UI rendering for dna item ... */
    //             // itemDiv.querySelector('button').onclick = () => { addToTemporaryBackpack(dna); /* update button UI */ };
    //             GameState.elements.dnaDrawResultsGrid.appendChild(itemDiv);
    //         });
    //     } else { /* ... show no DNA message ... */ }
    // }
    // openModal('dna-draw-modal'); // from ui.js
    console.log("DNA Draw: UI rendering and modal opening would be handled by ui.js", drawnDnaForModal);
    // Example of how it might interact with ui.js for rendering
    // UiRenderer.renderDnaDrawResults(drawnDnaForModal); // Hypothetical function in ui.js
    // UiControls.openModal('dna-draw-modal'); // Hypothetical function in ui.js
}

export function addToTemporaryBackpack(dnaItem) {
    let added = false;
    for (let i = 0; i < GameState.NUM_TEMP_BACKPACK_SLOTS; i++) {
        if (GameState.temporaryBackpackSlots[i] === null) {
            const newItem = {...dnaItem};
            newItem.baseId = dnaItem.baseId || (dnaItem.id ? (dnaItem.id.split('_')[0] + '_' + dnaItem.id.split('_')[1] + '_' + dnaItem.id.split('_')[2]) : `base_${Date.now()}`);
            newItem.id = dnaItem.id || `temp_dna_${Date.now()}_${i}`;
            GameState.temporaryBackpackSlots[i] = newItem;
            added = true; break;
        }
    }
    if (!added) {
        // showFeedbackModal("提示", `臨時背包已滿！ ${dnaItem.name} 已覆蓋最早的物品。`, false, true, false); // from ui.js
        console.log(`Temp backpack full. ${dnaItem.name} would overwrite.`);
        // For simplicity, let's assume it overwrites the first if full
        const newItem = {...dnaItem};
        newItem.baseId = dnaItem.baseId || (dnaItem.id ? (dnaItem.id.split('_')[0] + '_' + dnaItem.id.split('_')[1] + '_' + dnaItem.id.split('_')[2]) : `base_${Date.now()}`);
        newItem.id = dnaItem.id || `temp_dna_${Date.now()}_0`;
        GameState.temporaryBackpackSlots[0] = newItem;
    }
    // populateTemporaryBackpack(); // from ui.js
    console.log("Item added to temp backpack, UI update via ui.js needed.");
}

export function moveFromTempToInventory(tempSlotIndex) {
    const itemToMove = GameState.temporaryBackpackSlots[tempSlotIndex];
    if (!itemToMove) return;
    const emptyMainSlot = GameState.inventoryDisplaySlots.findIndex((slot, index) => slot === null && index < GameState.NUM_INVENTORY_SLOTS);
    if (emptyMainSlot !== -1) {
        GameState.inventoryDisplaySlots[emptyMainSlot] = itemToMove;
        GameState.temporaryBackpackSlots[tempSlotIndex] = null;
        // populateInventory(); // from ui.js
        // populateTemporaryBackpack(); // from ui.js
        if (GameState.currentLoggedInUser) savePlayerData();
        console.log("Item moved from temp to inventory. UI update via ui.js needed.");
    } else {
        // showFeedbackModal("提示", "DNA碎片庫已滿！請先清出空間。", false, true, false); // from ui.js
        console.log("Inventory full, cannot move item from temp.");
    }
}

export function promptDeleteItem(itemId, itemSlotIndex, itemSourceType, itemNameOverride = null) {
    GameState.itemToDeleteInfo = { id: itemId, slotIndex: itemSlotIndex, sourceType: itemSourceType };
    const itemName = itemNameOverride || (itemSourceType === 'inventory'
        ? (GameState.inventoryDisplaySlots[itemSlotIndex] ? GameState.inventoryDisplaySlots[itemSlotIndex].name : '該DNA')
        : (GameState.temporaryBackpackSlots[itemSlotIndex] ? GameState.temporaryBackpackSlots[itemSlotIndex].name : '該DNA'));

    // This part would interact with ui.js to show a confirmation modal
    // GameState.elements.confirmationModalBodyEl.innerHTML =`確定刪除DNA碎片 "${itemName}"？此動作無法復原。`;
    // if(GameState.elements.releaseMonsterImagePlaceholder) GameState.elements.releaseMonsterImagePlaceholder.style.display = 'none';
    // GameState.elements.confirmationModalTitleEl.textContent="刪除確認";
    // GameState.elements.confirmActionBtn.className = 'danger';
    // GameState.elements.confirmActionBtn.textContent = '確定刪除';
    // GameState.elements.confirmActionBtn.onclick = () => { /* ... actual deletion logic ... */ };
    // openModal('confirmation-modal'); // from ui.js
    console.log(`Prompt delete for ${itemName}. UI modal via ui.js needed.`);
    // Actual deletion logic (called by modal confirm button):
    // if (GameState.itemToDeleteInfo) {
    //     if (GameState.itemToDeleteInfo.sourceType === 'inventory') {
    //         GameState.inventoryDisplaySlots[GameState.itemToDeleteInfo.slotIndex] = null;
    //         GameState.playerOwnedDNA = GameState.playerOwnedDNA.filter(dna => (dna.id || dna.tempId) !== GameState.itemToDeleteInfo.id);
    //     } else if (GameState.itemToDeleteInfo.sourceType === 'temporary') {
    //         GameState.temporaryBackpackSlots[GameState.itemToDeleteInfo.slotIndex] = null;
    //     }
    //     GameState.combinationSlotsData.forEach((comboItem, comboIndex) => {
    //         if (comboItem && ((comboItem.id && comboItem.id === GameState.itemToDeleteInfo.id) || (comboItem.tempId && comboItem.tempId === GameState.itemToDeleteInfo.id))) {
    //             clearCombinationSlot(comboIndex, false);
    //         }
    //     });
    //     populateInventory(); // from ui.js
    //     populateTemporaryBackpack(); // from ui.js
    //     if (GameState.currentLoggedInUser) savePlayerData();
    //     GameState.itemToDeleteInfo = null;
    // }
    // closeModal('confirmation-modal'); // from ui.js
    // updateActionButtonsState();
}

// --- Drag and Drop Logic Stubs (actual implementation would be more complex and interact with ui.js) ---
export function handleDragStart(e) {
    console.log("Drag Start (game-logic.js)", e.target.dataset.dnaInfo);
    // Actual logic from index.html
    const dnaInfo = e.target.dataset.dnaInfo;
    if (!dnaInfo) { e.preventDefault(); return; }
    try { JSON.parse(dnaInfo); } catch (jsonError) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData('application/json', dnaInfo);
    const sourceType = e.target.closest('[data-droptype]').dataset.droptype;
    let sourceIndexStr;
    if (sourceType === 'inventory') sourceIndexStr = e.target.closest('[data-inventory-slot-index]').dataset.inventorySlotIndex;
    else if (sourceType === 'combination') sourceIndexStr = e.target.closest('[data-slot-id]').dataset.slotId;
    else if (sourceType === 'temporary') sourceIndexStr = e.target.closest('[data-slot-index]').dataset.slotIndex;
    else { e.preventDefault(); return; }
    if (sourceIndexStr === undefined || sourceIndexStr === null || String(sourceIndexStr).trim() === "") {
        e.preventDefault(); return;
    }
    e.dataTransfer.setData('text/source-type', sourceType);
    e.dataTransfer.setData('text/source-index', String(sourceIndexStr));
}

export function handleDrop(e) {
    console.log("Drop (game-logic.js)");
    // Actual logic from index.html, simplified
    e.preventDefault();
    const targetDropZone = e.target.closest('[data-droptype]');
    if (!targetDropZone || targetDropZone.dataset.droptype === "delete") return;
    // targetDropZone.classList.remove('border-[var(--accent-color)]', 'bg-[#2f2f4a]', 'drag-over'); // UI should handle this
    const dnaDataString = e.dataTransfer.getData('application/json');
    const sourceType = e.dataTransfer.getData('text/source-type');
    const sourceIndexString = e.dataTransfer.getData('text/source-index');
    if (!dnaDataString || !sourceType || sourceIndexString === null || sourceIndexString === undefined || sourceIndexString.trim() === "") { return; }
    const sourceIndex = parseInt(sourceIndexString, 10);
    if (isNaN(sourceIndex)) { return; }
    const droppedDNA = JSON.parse(dnaDataString);
    const targetDropType = targetDropZone.dataset.droptype;
    let moved = false;

    if (targetDropType === "combination") {
        const targetComboSlotIndex = parseInt(targetDropZone.dataset.slotId);
        if (!GameState.combinationSlotsData[targetComboSlotIndex]) {
            GameState.combinationSlotsData[targetComboSlotIndex] = droppedDNA;
            // updateCombinationSlotUI(targetComboSlotIndex, droppedDNA); // from ui.js
            if (sourceType === 'inventory') GameState.inventoryDisplaySlots[sourceIndex] = null;
            else if (sourceType === 'combination' && sourceIndex !== targetComboSlotIndex) clearCombinationSlotUI(sourceIndex); // from ui.js
            else if (sourceType === 'temporary') GameState.temporaryBackpackSlots[sourceIndex] = null;
            moved = true;
        }
    } else if (targetDropType === "inventory") {
        const targetInventorySlotIndex = parseInt(targetDropZone.dataset.inventorySlotIndex);
        if (!GameState.inventoryDisplaySlots[targetInventorySlotIndex]) {
            GameState.inventoryDisplaySlots[targetInventorySlotIndex] = droppedDNA;
            if (sourceType === 'combination') clearCombinationSlotUI(sourceIndex); // from ui.js
            else if (sourceType === 'temporary') GameState.temporaryBackpackSlots[sourceIndex] = null;
            else if (sourceType === 'inventory' && sourceIndex !== targetInventorySlotIndex) GameState.inventoryDisplaySlots[sourceIndex] = null;
            moved = true;
        }
    } else if (targetDropType === "temporary") {
        const targetTempSlotIndex = parseInt(targetDropZone.dataset.slotIndex);
         if (!GameState.temporaryBackpackSlots[targetTempSlotIndex]) {
            GameState.temporaryBackpackSlots[targetTempSlotIndex] = droppedDNA;
            if (sourceType === 'combination') clearCombinationSlotUI(sourceIndex); // from ui.js
            else if (sourceType === 'inventory') GameState.inventoryDisplaySlots[sourceIndex] = null;
            else if (sourceType === 'temporary' && sourceIndex !== targetTempSlotIndex) GameState.temporaryBackpackSlots[sourceIndex] = null;
            moved = true;
        }
    }
    if (moved) {
        updateAllUIDisplays(); // placeholder for individual UI updates
        updateActionButtonsState();
        if (GameState.currentLoggedInUser) savePlayerData();
    }
}
export function handleDropOnDeleteSlot(e) {
    console.log("Drop on Delete (game-logic.js)");
    // Actual logic from index.html
    e.preventDefault();
    const targetDropZone = e.target.closest('[data-droptype="delete"]');
    if (!targetDropZone) return;
    // targetDropZone.classList.remove('drag-over'); // UI should handle this
    const dnaDataString = e.dataTransfer.getData('application/json');
    const sourceType = e.dataTransfer.getData('text/source-type');
    const sourceIndexString = e.dataTransfer.getData('text/source-index');
    if (!dnaDataString || !sourceType || sourceIndexString === null || sourceIndexString === undefined) return;
    const sourceIndex = parseInt(sourceIndexString, 10);
    const droppedDNA = JSON.parse(dnaDataString);
    promptDeleteItem(droppedDNA.id || droppedDNA.tempId, sourceIndex, sourceType, droppedDNA.name);
}

export function handleDragOver(e) { e.preventDefault(); /* UI might add classes */ }
export function handleDragLeave(e) { /* UI might remove classes */ }
export function handleComboSlotClick(e) {
    console.log("Combo Slot Click (game-logic.js)");
    // Actual logic from index.html
    const cSE=e.target.closest('.dna-slot[data-droptype="combination"]');
    if(!cSE)return;
    const cSI=parseInt(cSE.dataset.slotId);
    if(GameState.combinationSlotsData[cSI]){clearCombinationSlot(cSI,true);}
}


export function clearCombinationSlot(comboSlotId, returnToInventory = true) {
    // const comboSlotElement = GameState.elements.dnaCombinationSlotsContainer?.querySelector(`.dna-slot[data-slot-id="${comboSlotId}"]`); // from ui.js
    // if (!comboSlotElement || !GameState.combinationSlotsData[comboSlotId]) return; // from ui.js
    const returnedDNA = GameState.combinationSlotsData[comboSlotId];
    // clearCombinationSlotUI(comboSlotId); // from ui.js

    if (returnToInventory && returnedDNA) {
        const emptyInventorySlotIndex = GameState.inventoryDisplaySlots.findIndex((slot, index) => slot === null && index < GameState.NUM_INVENTORY_SLOTS);
        if (emptyInventorySlotIndex !== -1) {
            GameState.inventoryDisplaySlots[emptyInventorySlotIndex] = returnedDNA;
        } else {
            const emptyTempSlotIndex = GameState.temporaryBackpackSlots.findIndex(slot => slot === null);
            if (emptyTempSlotIndex !== -1) {
                GameState.temporaryBackpackSlots[emptyTempSlotIndex] = returnedDNA;
                // populateTemporaryBackpack(); // from ui.js
            } else {
                GameState.playerOwnedDNA.push(returnedDNA);
                // showFeedbackModal("提示", `${returnedDNA.name} 已返回DNA庫，但背包和物品欄均已滿，請整理。`, false, true, false); // from ui.js
                console.log(`${returnedDNA.name} returned to DNA pool, but backpack and inventory are full.`);
            }
        }
    }
    // populateInventory(); // from ui.js
    updateActionButtonsState();
    if (GameState.currentLoggedInUser) savePlayerData();
    console.log(`Combination slot ${comboSlotId} cleared. UI update via ui.js needed.`);
}


// --- Monster Creation & AI ---
export async function combineDNA() {
    const dnaToCombine = GameState.combinationSlotsData.filter(slot => slot !== null);
    if (dnaToCombine.length === 0) {
        // showFeedbackModal("提示", "請先放入至少一個DNA碎片進行組合。", false, true, false); // from ui.js
        console.log("No DNA to combine.");
        return;
    }
    if (!GameState.currentLoggedInUser) {
        // showFeedbackModal("錯誤", "請先登入才能組合怪獸。", false, true, false); // from ui.js
        console.log("User not logged in for DNA combination.");
        return;
    }

    const idsToSend = dnaToCombine.map(dna => {
        if (dna.baseId) return dna.baseId;
        if (dna.id && typeof dna.id === 'string') {
            const parts = dna.id.split('_');
            if (parts.length >= 3 && parts[0] === 'dna' && parts[1] === 'frag') {
                return `${parts[0]}_${parts[1]}_${parts[2]}`;
            }
        }
        return dna.id || dna.tempId;
    });

    // showFeedbackModal("組合中...", "正在努力組合新的怪獸...", true, false); // from ui.js
    console.log("Combining DNA...", idsToSend);
    try {
        const idToken = await auth.currentUser?.getIdToken(); // from firebase-config.js
        // const response = await ApiClient.combineDNA(idsToSend, idToken); // Hypothetical API client call
        const response = await fetch(`${ApiClient.API_BASE_URL}/combine`, { // Direct fetch for now
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
            body: JSON.stringify({ dna_ids: idsToSend })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `伺服器錯誤 ${response.status}` }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        let newMonster = await response.json();

        if (newMonster && !newMonster.error) {
            newMonster = await generateAndStoreAIDescriptions(newMonster);

            const isFirstMonsterEver = GameState.farmedMonsters.length === 0 && (!GameState.playerStats.achievements || !GameState.playerStats.achievements.includes("首次組合怪獸"));

            if (GameState.farmedMonsters.length < GameState.MAX_FARM_SLOTS) {
                GameState.farmedMonsters.push(newMonster);
                addLogEntry(newMonster, "✨ 成功組合誕生！");
                if (isFirstMonsterEver) {
                    newMonster.farmStatus.isBattling = true;
                    GameState.battlingMonsterId = newMonster.id;
                    GameState.currentMonster = newMonster;
                    addLogEntry(newMonster, "🟢 自動進入出戰狀態 (首次合成)。");
                }
            } else {
                addToTemporaryBackpack(newMonster); // Adds to GameState.temporaryBackpackSlots
                // showFeedbackModal("農場已滿", `${newMonster.nickname} 已放入您的臨時背包。`, false, true, false); // from ui.js
                console.log(`Farm full. ${newMonster.nickname} added to temp backpack.`);
                // setTimeout(() => showFeedbackModal(`怪獸 "${newMonster.nickname}" 組合成功！`, `(因農場已滿，已放入臨時背包)`, false, true, true, newMonster), 2500); // from ui.js
            }

            // populateFarmList(); // from ui.js
            // updateMonsterSnapshotDisplay(GameState.currentMonster); // from ui.js
            // if(GameState.elements.monsterInfoButton) GameState.elements.monsterInfoButton.disabled = !GameState.currentMonster; // from ui.js

            if(GameState.playerStats.achievements && !GameState.playerStats.achievements.includes("首次組合怪獸")) {
                GameState.playerStats.achievements.push("首次組合怪獸");
            }
            savePlayerData();
            // showFeedbackModal(`怪獸 "${newMonster.nickname}" 組合成功！`, ``, false, true, true, newMonster); // from ui.js
            console.log(`Monster ${newMonster.nickname} combined successfully. UI update via ui.js needed.`);
        } else {
            throw new Error(newMonster.error || "後端回傳組合錯誤但未提供詳細訊息。");
        }
    } catch (error) {
        console.error("DNA 組合失敗:", error);
        // showFeedbackModal("組合失敗", `DNA組合失敗：${error.message}`, false, true, false); // from ui.js
    } finally {
        GameState.combinationSlotsData.fill(null);
        // createCombinationSlots(); // from ui.js
        updateActionButtonsState();
    }
}

export async function generateAndStoreAIDescriptions(monster) {
    if (!monster || (monster.aiPersonality && monster.aiIntroduction && monster.aiEvaluation)) {
        return monster;
    }
    // showFeedbackModal(`為 ${monster.nickname} 生成AI評價`, "正在與AI溝通，請稍候...", true, false); // from ui.js
    console.log(`Generating AI descriptions for ${monster.nickname}`);
    // ... (Actual API call logic as in index.html) ...
    // This function would use ApiClient.generateAIDescriptions(prompt)
    // For now, simulate a delay and set defaults
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    monster.aiPersonality = monster.aiPersonality || "AI個性描述生成中或已失敗。";
    monster.aiIntroduction = monster.aiIntroduction || "AI介紹生成中或已失敗。";
    monster.aiEvaluation = monster.aiEvaluation || "AI評價生成中或已失敗。";

    // const monsterInfoModalEl = document.getElementById('monster-info-modal'); // from ui.js or GameState.elements
    // if (monsterInfoModalEl && monsterInfoModalEl.style.display === 'flex') {
    //     const headerNameEl = GameState.elements.monsterInfoModalHeaderContent?.querySelector('.monster-info-name-styled');
    //     if (headerNameEl && headerNameEl.textContent === monster.nickname) {
    //         updateMonsterInfoModal(monster); // from ui.js
    //     }
    // }
    if (GameState.currentLoggedInUser) savePlayerData();
    console.log(`AI Descriptions for ${monster.nickname} (simulated).`);
    return monster;
}


// --- Farm Logic ---
export function toggleBattleStatus(monsterIdToBattle) {
    let newBattlingMonster = null;
    let changed = false;
    GameState.farmedMonsters.forEach(m => {
        if (!m.farmStatus) m.farmStatus = {};
        if (m.id === monsterIdToBattle) {
            if (m.farmStatus.isTraining || m.farmStatus.active) {
                // showFeedbackModal("提示", `${m.nickname} 正在${m.farmStatus.isTraining ? '修煉' : '拾荒'}中，無法出戰。`, false, true, false); // from ui.js
                console.log(`${m.nickname} is busy, cannot battle.`);
                return;
            }
            const previousBattleStatus = m.farmStatus.isBattling;
            m.farmStatus.isBattling = !m.farmStatus.isBattling;
            if (m.farmStatus.isBattling !== previousBattleStatus) changed = true;
            addLogEntry(m, m.farmStatus.isBattling ? "🟢 進入出戰狀態。" : "🔴 解除出戰狀態，開始休息。");
            if (m.farmStatus.isBattling) newBattlingMonster = m;
        } else {
            if (m.farmStatus.isBattling) changed = true;
            m.farmStatus.isBattling = false;
        }
    });

    GameState.battlingMonsterId = newBattlingMonster ? newBattlingMonster.id : null;
    if (newBattlingMonster) {
        GameState.currentMonster = newBattlingMonster;
    } else {
        GameState.currentMonster = GameState.farmedMonsters.find(m => m.farmStatus && !m.farmStatus.isBattling && !m.farmStatus.isTraining && !m.farmStatus.active) || (GameState.farmedMonsters.length > 0 ? GameState.farmedMonsters[0] : null);
    }

    // updateMonsterSnapshotDisplay(GameState.currentMonster); // from ui.js
    // if(GameState.elements.monsterInfoButton) {
    //     GameState.elements.monsterInfoButton.disabled = !GameState.currentMonster;
    //     if (GameState.currentMonster) GameState.elements.monsterInfoButton.onclick = () => { updateMonsterInfoModal(GameState.currentMonster); openModal('monster-info-modal');};
    //     else GameState.elements.monsterInfoButton.onclick = null;
    // }
    // populateFarmList(); // from ui.js
    if (changed && GameState.currentLoggedInUser) savePlayerData();
    console.log(`Battle status toggled for ${monsterIdToBattle}. UI update via ui.js needed.`);
}

export function openCultivationSetupModal(monsterId) {
    GameState.currentCultivationMonster = GameState.farmedMonsters.find(m => m.id === monsterId);
    if (!GameState.currentCultivationMonster /*|| !GameState.elements.cultivationMonsterName*/) return; // DOM element access via ui.js
    // GameState.elements.cultivationMonsterName.textContent = GameState.currentCultivationMonster.nickname;
    // if (GameState.elements.maxCultivationTimeSpan) GameState.elements.maxCultivationTimeSpan.textContent = GameState.MAX_CULTIVATION_SECONDS;
    // openModal('cultivation-setup-modal'); // from ui.js
    console.log(`Open cultivation setup for ${monsterId}. UI via ui.js needed.`);
}

export function startCultivation() { // Called by event handler
    if (!GameState.currentCultivationMonster) return;
    if (!GameState.currentCultivationMonster.farmStatus) GameState.currentCultivationMonster.farmStatus = {};
    GameState.currentCultivationMonster.farmStatus.isTraining = true;
    GameState.currentCultivationMonster.farmStatus.trainingStartTime = Date.now();
    GameState.currentCultivationMonster.farmStatus.active = false;
    GameState.currentCultivationMonster.farmStatus.type = 'train';
    GameState.currentCultivationMonster.farmStatus.boosts = GameState.currentCultivationMonster.farmStatus.boosts || { hp: 0, mp: 0, attack: 0, defense: 0, speed: 0, crit: 0};
    addLogEntry(GameState.currentCultivationMonster, "🏋️ 開始了新的修煉。");
    // closeModal('cultivation-setup-modal'); // from ui.js
    // populateFarmList(); // from ui.js
    if (GameState.currentLoggedInUser) savePlayerData();

    if (GameState.currentCultivationMonster.farmStatus.timerId) clearInterval(GameState.currentCultivationMonster.farmStatus.timerId);
    GameState.currentCultivationMonster.farmStatus.timerId = setInterval(() => {
        const monsterInFarm = GameState.farmedMonsters.find(m => m.id === GameState.currentCultivationMonster.id);
        if (!monsterInFarm || !monsterInFarm.farmStatus || !monsterInFarm.farmStatus.isTraining) {
             if(GameState.currentCultivationMonster.farmStatus.timerId) clearInterval(GameState.currentCultivationMonster.farmStatus.timerId);
             GameState.currentCultivationMonster.farmStatus.timerId = null;
             return;
        }
        const elapsedSeconds = Math.floor((Date.now() - (GameState.currentCultivationMonster.farmStatus.trainingStartTime || Date.now())) / 1000);
        // const farmItem = GameState.elements.farmedMonstersListContainer?.querySelector(`.farm-monster-item[data-monster-id="${GameState.currentCultivationMonster.id}"]`);
        // if (farmItem) {
        //     const statusDiv = farmItem.querySelector('.farm-monster-status');
        //     if (statusDiv) updateFarmMonsterStatusDisplay(GameState.currentCultivationMonster, statusDiv); // from ui.js
        // }
        console.log(`Cultivation timer tick for ${GameState.currentCultivationMonster.nickname}. UI update via ui.js needed.`);
        if (elapsedSeconds >= GameState.MAX_CULTIVATION_SECONDS) {
            console.log(`${GameState.currentCultivationMonster.nickname} 修煉已達上限 ${GameState.MAX_CULTIVATION_SECONDS} 秒。自動結束。`);
            pauseTraining(GameState.currentCultivationMonster.id);
        }
    }, 1000);
    console.log("Cultivation started.");
}

export function pauseTraining(monsterId) {
    const monster = GameState.farmedMonsters.find(m => m.id === monsterId);
    if (!monster || !monster.farmStatus || !monster.farmStatus.isTraining) return;
    if (monster.farmStatus.timerId) {
        clearInterval(monster.farmStatus.timerId);
        monster.farmStatus.timerId = null;
    }
    let trainingDuration = Math.floor((Date.now() - (monster.farmStatus.trainingStartTime || Date.now())) / 1000);
    trainingDuration = Math.min(trainingDuration, GameState.MAX_CULTIVATION_SECONDS);

    monster.farmStatus.isTraining = false;
    addLogEntry(monster, `修煉結束，共持續 ${trainingDuration} 秒。`);
    resolveTrainingAndShowResults(monster, trainingDuration);
    // populateFarmList(); // from ui.js
    if (GameState.currentLoggedInUser) savePlayerData();
    console.log(`Training paused for ${monsterId}. UI update via ui.js needed.`);
}

export function resolveTrainingAndShowResults(monster, durationSeconds) {
    let story = `在 ${Math.floor(durationSeconds / 60)}分${durationSeconds % 60}秒 的刻苦修煉中，${monster.nickname} `;
    let growthLogHTML = ""; // This would be data for ui.js to render
    GameState.itemsFromCurrentTraining = [];
    // ... (logic for story, growth, items as in index.html) ...
    console.log(`Resolving training for ${monster.nickname}, duration: ${durationSeconds}s. Story: ${story}`);

    // if(GameState.elements.trainingResultsModalTitle) GameState.elements.trainingResultsModalTitle.innerHTML = `🎉 ${monster.nickname} 修煉成果 🎉`;
    // if(GameState.elements.trainingStoryResult) GameState.elements.trainingStoryResult.innerHTML = story;
    // if(GameState.elements.trainingGrowthResult) GameState.elements.trainingGrowthResult.innerHTML = growthLogHTML || "<p>無數值變化。</p>";
    // renderTrainingItems(); // from ui.js
    // openModal('training-results-modal'); // from ui.js
    // updateMonsterInfoModal(monster); // from ui.js
    // updateMonsterSnapshotDisplay(monster === GameState.currentMonster ? monster : GameState.currentMonster); // from ui.js
    console.log("Training results resolved. UI update and modal via ui.js needed.");
}

export function addAllTrainingItemsToBackpack() {
    GameState.itemsFromCurrentTraining.forEach((item, index) => {
        if (!item.addedToBackpack) {
            addToTemporaryBackpack(item);
            item.addedToBackpack = true;
            // const btn = GameState.elements.trainingItemsResult?.querySelector(`.add-one-to-temp-backpack-btn[data-item-index="${index}"]`);
            // if (btn) { btn.textContent = '已加入'; btn.disabled = true; } // UI update via ui.js
        }
    });
    if (GameState.currentLoggedInUser) savePlayerData();
    console.log("All training items added to temp backpack. UI update via ui.js needed.");
}

export function closeTrainingResultsAndCheckReminder() {
    const unaddedItems = GameState.itemsFromCurrentTraining.filter(item => !item.addedToBackpack);
    if (unaddedItems.length > 0) {
        // openModal('reminder-modal'); // from ui.js
        console.log("Unadded training items exist, show reminder modal via ui.js.");
    } else {
        GameState.itemsFromCurrentTraining = [];
        // closeModal('training-results-modal'); // from ui.js
        console.log("Closing training results modal (no unadded items).");
    }
}
// Logic for reminderConfirmCloseBtn.onclick:
// GameState.itemsFromCurrentTraining = [];
// closeModal('reminder-modal');
// closeModal('training-results-modal');

export function promptReleaseMonster(monsterIdToRelease) {
    const monsterIndex = GameState.farmedMonsters.findIndex(m => m.id === monsterIdToRelease);
    if (monsterIndex === -1) return;
    GameState.monsterToReleaseInfo = { farmIndex: monsterIndex, id: monsterIdToRelease };
    const monster = GameState.farmedMonsters[monsterIndex];
    // ... (UI logic for confirmation modal as in index.html, would be in ui.js) ...
    // GameState.elements.confirmActionBtn.onclick = () => { /* actual release logic */ };
    // openModal('confirmation-modal'); // from ui.js
    console.log(`Prompt release for ${monster.nickname}. UI modal via ui.js needed.`);
    // Actual release logic (called by modal confirm button):
    // if (GameState.monsterToReleaseInfo && GameState.monsterToReleaseInfo.id) {
    //     const releasedMonster = GameState.farmedMonsters.find(m => m.id === GameState.monsterToReleaseInfo.id);
    //     if (releasedMonster) {
    //         GameState.farmedMonsters = GameState.farmedMonsters.filter(m => m.id !== GameState.monsterToReleaseInfo.id);
    //         // showFeedbackModal("放生成功", `${releasedMonster.nickname} 已經回歸大自然了。`, false, true, false); // from ui.js
    //         if (GameState.currentMonster && GameState.currentMonster.id === releasedMonster.id) { /* ... update currentMonster ... */ }
    //         if (GameState.battlingMonsterId === releasedMonster.id) { /* ... update battlingMonsterId ... */ }
    //     }
    //     // populateFarmList(); // from ui.js
    //     // openAndPopulatePlayerInfoModal(GameState.playerStats, GameState.currentLoggedInUser?.uid); // from ui.js
    //     GameState.monsterToReleaseInfo = null;
    //     if (GameState.currentLoggedInUser) savePlayerData();
    // }
    // closeModal('confirmation-modal'); updateActionButtonsState();
}


// --- Logging ---
export function addLogEntry(monster, message) {
    if (!monster || !message) return;
    const timestamp = new Date().toLocaleString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit'});
    if (!monster.activityLog) monster.activityLog = [];
    monster.activityLog.unshift({ time: timestamp, message: message });
    if (monster.activityLog.length > 20) monster.activityLog.pop();

    // const monsterInfoModalEl = document.getElementById('monster-info-modal'); // from GameState.elements or ui.js
    // if (monsterInfoModalEl && monsterInfoModalEl.style.display === 'flex') {
    //     const headerName = GameState.elements.monsterInfoModalHeaderContent?.querySelector('.monster-info-name-styled');
    //     if (headerName && headerName.textContent === monster.nickname) {
    //         updateMonsterActivityLog(monster); // from ui.js
    //     }
    // }
    console.log(`Log for ${monster.nickname}: ${message}. UI update for log modal via ui.js if open.`);
}


// --- Battle & Social ---
export async function promptChallengeMonster(opponentMonsterData) {
    GameState.monsterToChallengeInfo = opponentMonsterData;
    const playerMonster = GameState.battlingMonsterId ? GameState.farmedMonsters.find(m => m.id === GameState.battlingMonsterId) : GameState.currentMonster;
    if (!playerMonster) {
        // showFeedbackModal("挑戰失敗", "你需要先指定一隻出戰怪獸才能挑戰！", false, true, false); // from ui.js
        console.log("Challenge failed: No battling monster selected.");
        return;
    }
    // ... (UI logic for confirmation modal as in index.html, would be in ui.js) ...
    // GameState.elements.confirmActionBtn.onclick = async () => { /* ... battle simulation logic ... */ };
    // openModal('confirmation-modal'); // from ui.js
    console.log(`Prompt challenge ${playerMonster.nickname} vs ${opponentMonsterData.nickname}. UI modal via ui.js needed.`);
    // Actual battle simulation logic (called by modal confirm button):
    // try {
    //     const idToken = await auth.currentUser?.getIdToken(); // from firebase-config.js
    //     // const battleResult = await ApiClient.simulateBattle(playerMonster, GameState.monsterToChallengeInfo, idToken);
    //     // displayBattleLog(battleResult.log); // from ui.js
    //     // ... (update player stats, monster resume, savePlayerData as in index.html) ...
    // } catch (error) { /* ... error handling ... */ }
}

export async function searchFriends(searchTerm) {
    // const lowerSearchTerm = searchTerm.toLowerCase().trim();
    // if (!lowerSearchTerm || lowerSearchTerm.length < 1) { /* ... update UI ... */ return; }
    // GameState.elements.friendsListContainer.innerHTML = '<p>搜尋中...</p>'; // from ui.js
    console.log(`Searching friends: ${searchTerm}. UI update via ui.js needed.`);
    // try {
    //     const idToken = GameState.currentLoggedInUser ? await GameState.currentLoggedInUser.getIdToken() : null; // from firebase-config.js
    //     // const data = await ApiClient.searchPlayers(lowerSearchTerm, idToken);
    //     // displaySearchedPlayers(data.players || []); // from ui.js
    // } catch (error) { /* ... error handling and UI update ... */ }
}

export async function showPlayerInfoPopup(playerUid) {
    if (!playerUid) return;
    // showFeedbackModal("讀取中...", "正在獲取玩家資訊...", true, false); // from ui.js
    console.log(`Fetching player info for popup: ${playerUid}.`);
    // try {
    //     const idToken = GameState.currentLoggedInUser ? await GameState.currentLoggedInUser.getIdToken() : null; // from firebase-config.js
    //     // const playerDataFromApi = await ApiClient.getPlayer(playerUid, idToken);
    //     // openAndPopulatePlayerInfoModal(playerDataFromApi, playerUid); // from ui.js
    //     // closeModal('feedback-modal'); // from ui.js
    // } catch (error) { /* ... error handling ... */ }
}


// --- Data Persistence ---
export async function savePlayerData() {
    if (!GameState.currentLoggedInUser || !db) return; // db from firebase-config.js
    const userId = GameState.currentLoggedInUser.uid;
    // ... (data preparation as in index.html) ...
    const dataToSave = { /* ... */ };
    // try {
    //     // await ApiClient.savePlayerData(userId, dataToSave); // Or direct Firestore call
    //     console.log("Player data saved to Firestore.");
    // } catch (error) { /* ... error handling ... */ }
    console.log("Attempting to save player data for " + userId);
}

export async function loadGameDataForUser(userId, userNickname) {
    console.log(`Loading game data for ${userNickname} (UID: ${userId}) - from game-logic.js`);
    GameState.currentPlayerNickname = userNickname;
    // if(GameState.elements.snapshotNickname) GameState.elements.snapshotNickname.textContent = userNickname; // from ui.js
    // showFeedbackModal("載入中...", `歡迎回來，${userNickname}！正在載入您的遊戲資料...`, true, false); // from ui.js

    // try {
    //     const idToken = await auth.currentUser?.getIdToken(); // from firebase-config.js
    //     // const data = await ApiClient.getPlayer(userId, idToken);
    //     // ... (process data, update GameState variables as in index.html) ...
    //     // initializeInventoryDisplay(); // from ui.js
    //     // populateFarmList(); // from ui.js
    //     // updateMonsterSnapshotDisplay(GameState.currentMonster); // from ui.js
    // } catch (error) { /* ... error handling, set defaults ... */ }
    // updateActionButtonsState();
    // closeModal('feedback-modal'); // from ui.js
    console.log("Game data loading logic. UI updates via ui.js needed.");
}

export async function saveInitialPlayerDataToBackend(userId, nickname, initialStats) {
    if (!GameState.currentLoggedInUser || !db) return; // db from firebase-config.js
    // ... (data preparation as in index.html, including initial DNA) ...
    const userProfileData = { /* ... */ };
    const initialGameData = { /* ... */ };
    // try {
    //     // await ApiClient.saveInitialPlayerData(userId, userProfileData, initialGameData); // Or direct Firestore
    //     console.log("New player initial data saved to Firestore.");
    // } catch (error) { /* ... error handling ... */ }
    console.log(`Saving initial player data for ${nickname} (UID: ${userId})`);
}


// --- Game Setup ---
export async function fetchGameConfigs() {
    console.log("Fetching game configs - from game-logic.js");
    // try {
    //     // const configs = await ApiClient.fetchGameConfigs();
    //     // GameState.gameSettings = { ...configs };
    //     // GameState.newbieGuideData = GameState.gameSettings.newbieGuide;
    //     // populateNewbieGuide(); // from ui.js
    //     // initializeNpcMonsters();
    // } catch (error) { /* ... error handling, set defaults ... */ }
    console.log("Game configs fetching logic. UI updates via ui.js needed.");
}

export function initializeNpcMonsters() {
    // GameState.npcMonsters = [];
    // ... (logic for generating NPC monsters as in index.html, using GameState.gameSettings) ...
    console.log("NPC Monsters initialized (simulated).");
}

// Placeholder for GameState (replace with actual import and state management)
const GameState = {
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
    currentMonster: null,
    battlingMonsterId: null,
    playerStats: { achievements: [] },
    itemsFromCurrentTraining: [],
    monsterToReleaseInfo: null,
    monsterToChallengeInfo: null,
    currentCultivationMonster: null,
    MAX_CULTIVATION_SECONDS: 999,
    npcMonsters: [],
    newbieGuideData: [],
    // elements: { /* references to DOM elements, ideally managed by ui.js */ }
};

// Placeholder for Firebase auth and db (replace with actual import)
const auth = { currentUser: { getIdToken: async () => "fake-token" } };
const db = {}; // Firestore instance
const firebase = { firestore: { FieldValue: { serverTimestamp: () => Date.now() }}}; // Firebase namespace

// Placeholder for API Client (replace with actual import)
const ApiClient = {
    API_BASE_URL: 'http://localhost:5000/api/MD', // Example
    // async combineDNA(ids, token) { /* ... */ },
    // async getPlayer(id, token) { /* ... */ },
    // ... other API functions
};

// Placeholder for UI functions (replace with actual import from ui.js)
// function showFeedbackModal(...args) { console.log("UI: showFeedbackModal", ...args); }
// function openModal(id) { console.log("UI: openModal", id); }
// function closeModal(id) { console.log("UI: closeModal", id); }
// function populateTemporaryBackpack() { console.log("UI: populateTemporaryBackpack"); }
// function populateInventory() { console.log("UI: populateInventory"); }
// function populateFarmList() { console.log("UI: populateFarmList"); }
// function updateMonsterSnapshotDisplay(monster) { console.log("UI: updateMonsterSnapshotDisplay", monster); }
// function updateMonsterInfoModal(monster) { console.log("UI: updateMonsterInfoModal", monster); }
// function displayBattleLog(log) { console.log("UI: displayBattleLog", log); }
// function renderTrainingItems() { console.log("UI: renderTrainingItems"); }
// function getElementStyling(type) { return { text: '#000', bg: '#fff'}; }
// function getContrastColor(hex) { return '#000'; }
// function createCombinationSlots() { console.log("UI: createCombinationSlots"); }
// function updateFarmMonsterStatusDisplay(monster, div) { console.log("UI: updateFarmMonsterStatusDisplay", monster); }
// function openAndPopulatePlayerInfoModal(stats, uid) { console.log("UI: openAndPopulatePlayerInfoModal", stats, uid); }
// function displaySearchedPlayers(players) { console.log("UI: displaySearchedPlayers", players); }
// function initializeInventoryDisplay() { console.log("UI: initializeInventoryDisplay"); }
// function updateMonsterActivityLog(monster) { console.log("UI: updateMonsterActivityLog", monster); }
// function clearCombinationSlotUI(id) { console.log("UI: clearCombinationSlotUI", id); }
