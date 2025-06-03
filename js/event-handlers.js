// event-handlers.js

/**
 * 理想情況下，您會從其他模組導入這些函式：
 * import { openModal, closeModal, showFeedbackModal, applyTheme, populateNewbieGuide,
 * updateMonsterInfoModal, openAndPopulatePlayerInfoModal,
 * setupMonsterLeaderboardTabs, populateMonsterLeaderboard, populatePlayerLeaderboard,
 * openDnaFarmTab, openGenericTab, setupDropZones } from './ui.js'; // (部分函式可能在 game-logic.js)
 *
 * import { combineDNA, handleDrawDnaButtonClick, toggleBattleStatus, promptReleaseMonster,
 * startCultivation, addAllTrainingItemsToBackpack, closeTrainingResultsAndCheckReminder,
 * searchFriends, promptChallengeMonster, moveFromTempToInventory,
 * handleComboSlotClick, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDropOnDeleteSlot
 * } from './game-logic.js'; // (部分拖放函式可能在 ui.js 或 drag-drop.js)
 *
 * import { handleRegister, handleLogin, handleLogout } from './auth.js';
 * import * as GameState from './game-state.js'; // 假設您有一個 game-state.js 來管理狀態和DOM元素引用
 * import { auth } from './firebase-config.js'; // 從 Firebase 設定檔獲取 auth
 */

// --- DOM Element References ---
// 在一個完整的模組化系統中，這些元素引用最好是從一個專門的DOM管理模組獲取，
// 或者作為參數傳遞給初始化函式。為了簡化，這裡直接獲取。
function getStaticElements() {
    return {
        themeSwitcherBtn: document.getElementById('theme-switcher'),
        // Auth
        showLoginFormBtn: document.getElementById('show-login-form-btn'),
        showRegisterFormBtn: document.getElementById('show-register-form-btn'),
        registerSubmitBtn: document.getElementById('register-submit-btn'),
        loginSubmitBtn: document.getElementById('login-submit-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        // Top Navigation
        monsterInfoButton: document.getElementById('monster-info-button'),
        playerInfoButton: document.getElementById('player-info-button'),
        showMonsterLeaderboardBtn: document.getElementById('show-monster-leaderboard-btn'),
        showPlayerLeaderboardBtn: document.getElementById('show-player-leaderboard-btn'),
        friendsListBtn: document.getElementById('friends-list-btn'),
        newbieGuideBtn: document.getElementById('newbie-guide-btn'),
        // DNA Actions
        combineButton: document.getElementById('combine-button'),
        // Tabs (示例，您可能需要更精確的選擇器或ID)
        dnaInventoryTab: document.querySelector('#dna-farm-tabs .tab-button[onclick*="dna-inventory-content"]'),
        monsterFarmTab: document.querySelector('#dna-farm-tabs .tab-button[onclick*="monster-farm-content"]'),
        exchangeTab: document.querySelector('#dna-farm-tabs .tab-button[onclick*="exchange-content"]'),
        homesteadTab: document.querySelector('#dna-farm-tabs .tab-button[onclick*="homestead-content"]'),
        guildTab: document.querySelector('#dna-farm-tabs .tab-button[onclick*="guild-content"]'),
        monsterDetailsInfoTab: document.querySelector('#monster-info-tabs .tab-button[onclick*="monster-details-tab"]'),
        monsterLogsInfoTab: document.querySelector('#monster-info-tabs .tab-button[onclick*="monster-logs-tab"]'),
        // Modals - specific action buttons
        cancelActionBtn: document.getElementById('cancel-action-btn'), // Confirmation modal cancel
        startCultivationBtn: document.getElementById('start-cultivation-btn'),
        addAllToTempBackpackBtn: document.getElementById('add-all-to-temp-backpack-btn'),
        reminderConfirmCloseBtn: document.getElementById('reminder-confirm-close-btn'),
        // Inputs
        newbieGuideSearchInput: document.getElementById('newbie-guide-search-input'),
        friendsListSearchInput: document.getElementById('friends-list-search-input'),
    };
}

// --- Event Handler Functions (Stubs or actual implementations) ---
// 實際的處理邏輯通常會呼叫從其他模組導入的函式

function handleThemeSwitch() {
    // 假設 applyTheme 是從 ui.js 導入的
    // const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    // applyTheme(newTheme);
    console.log("Theme switch clicked. Call 'applyTheme' from ui.js");
}

function handleOpenModal(modalId) {
    // 假設 openModal 是從 ui.js 導入的
    // openModal(modalId);
    console.log(`Request to open modal: ${modalId}. Call 'openModal' from ui.js`);
}

function handleCloseModal(event) {
    const modal = event.target.closest('.modal');
    if (modal && modal.id) {
        // 假設 closeModal 是從 ui.js 導入的
        // closeModal(modal.id);
        console.log(`Request to close modal: ${modal.id} via button. Call 'closeModal' from ui.js`);
    }
}

function handleTabSwitch(event, tabName, containerQuerySelector) {
    // 假設 openDnaFarmTab 或 openGenericTab 是從 ui.js 導入的
    let containerId = null;
    if (event.currentTarget && event.currentTarget.closest(containerQuerySelector)) {
        containerId = event.currentTarget.closest(containerQuerySelector).id;
    }
    console.log(`Tab switch: ${tabName}, container: ${containerId}. Call appropriate tab function from ui.js`);
    // if (containerId === 'dna-farm-tabs') {
    //     openDnaFarmTab(event, tabName);
    // } else if (containerId === 'monster-info-tabs') {
    //     openGenericTab(event, tabName, 'monster-info-modal');
    // }
}

// --- Main Function to Initialize All Static Event Listeners ---
export function initializeStaticEventListeners() {
    const elements = getStaticElements();

    if (elements.themeSwitcherBtn) {
        elements.themeSwitcherBtn.addEventListener('click', handleThemeSwitch);
    }

    // Auth Buttons
    if (elements.showLoginFormBtn) {
        elements.showLoginFormBtn.addEventListener('click', () => handleOpenModal('login-modal'));
    }
    if (elements.showRegisterFormBtn) {
        elements.showRegisterFormBtn.addEventListener('click', () => handleOpenModal('register-modal'));
    }
    if (elements.registerSubmitBtn) {
        // elements.registerSubmitBtn.addEventListener('click', handleRegister); // handleRegister from auth.js
        elements.registerSubmitBtn.addEventListener('click', () => console.log("Register submit clicked. Call 'handleRegister' from auth.js"));
    }
    if (elements.loginSubmitBtn) {
        // elements.loginSubmitBtn.addEventListener('click', handleLogin); // handleLogin from auth.js
        elements.loginSubmitBtn.addEventListener('click', () => console.log("Login submit clicked. Call 'handleLogin' from auth.js"));
    }
    if (elements.logoutBtn) {
        // elements.logoutBtn.addEventListener('click', handleLogout); // handleLogout from auth.js
        elements.logoutBtn.addEventListener('click', () => console.log("Logout clicked. Call 'handleLogout' from auth.js"));
    }

    // Top Navigation Buttons
    if (elements.monsterInfoButton) {
        // elements.monsterInfoButton.addEventListener('click', () => { /* logic from game-state & ui.js */ });
        elements.monsterInfoButton.addEventListener('click', () => console.log("Monster Info clicked. Complex logic involving game-state.js and ui.js"));
    }
    if (elements.playerInfoButton) {
        // elements.playerInfoButton.addEventListener('click', () => { /* logic from game-state & ui.js */ });
        elements.playerInfoButton.addEventListener('click', () => console.log("Player Info clicked. Complex logic involving game-state.js and ui.js"));
    }
    if (elements.showMonsterLeaderboardBtn) {
        // elements.showMonsterLeaderboardBtn.addEventListener('click', () => { setupMonsterLeaderboardTabs(); populateMonsterLeaderboard(); openModal('monster-leaderboard-modal'); });
        elements.showMonsterLeaderboardBtn.addEventListener('click', () => console.log("Show Monster Leaderboard. Calls functions from ui.js"));
    }
    if (elements.showPlayerLeaderboardBtn) {
        // elements.showPlayerLeaderboardBtn.addEventListener('click', () => { populatePlayerLeaderboard(); openModal('player-leaderboard-modal'); });
        elements.showPlayerLeaderboardBtn.addEventListener('click', () => console.log("Show Player Leaderboard. Calls functions from ui.js"));
    }
    if (elements.friendsListBtn) {
        // elements.friendsListBtn.addEventListener('click', () => { /* open friends modal, clear input - ui.js */ });
        elements.friendsListBtn.addEventListener('click', () => { handleOpenModal('friends-list-modal'); console.log("Also clear search input."); });
    }
    if (elements.newbieGuideBtn) {
        // elements.newbieGuideBtn.addEventListener('click', () => { populateNewbieGuide(); openModal('newbie-guide-modal'); });
        elements.newbieGuideBtn.addEventListener('click', () => { console.log("Show Newbie Guide. Calls populateNewbieGuide and openModal from ui.js"); handleOpenModal('newbie-guide-modal');});
    }

    // DNA Actions
    if (elements.combineButton) {
        // elements.combineButton.addEventListener('click', combineDNA); // combineDNA from game-logic.js
        elements.combineButton.addEventListener('click', () => console.log("Combine DNA clicked. Call 'combineDNA' from game-logic.js"));
    }

    // Tab Buttons (Refactoring from HTML onclick)
    if(elements.dnaInventoryTab) elements.dnaInventoryTab.addEventListener('click', (event) => handleTabSwitch(event, 'dna-inventory-content', '#dna-farm-tabs'));
    if(elements.monsterFarmTab) elements.monsterFarmTab.addEventListener('click', (event) => handleTabSwitch(event, 'monster-farm-content', '#dna-farm-tabs'));
    if(elements.exchangeTab) elements.exchangeTab.addEventListener('click', (event) => handleTabSwitch(event, 'exchange-content', '#dna-farm-tabs'));
    if(elements.homesteadTab) elements.homesteadTab.addEventListener('click', (event) => handleTabSwitch(event, 'homestead-content', '#dna-farm-tabs'));
    if(elements.guildTab) elements.guildTab.addEventListener('click', (event) => handleTabSwitch(event, 'guild-content', '#dna-farm-tabs'));

    if(elements.monsterDetailsInfoTab) elements.monsterDetailsInfoTab.addEventListener('click', (event) => handleTabSwitch(event, 'monster-details-tab', '#monster-info-tabs'));
    if(elements.monsterLogsInfoTab) elements.monsterLogsInfoTab.addEventListener('click', (event) => handleTabSwitch(event, 'monster-logs-tab', '#monster-info-tabs'));


    // Modal Close Buttons (Refactoring from HTML onclick)
    const allModalCloseButtons = document.querySelectorAll('.modal-close'); // Gets all 'x' buttons
    allModalCloseButtons.forEach(btn => {
        // Ensure we don't re-add listeners if this script runs multiple times, though ideally it won't.
        // A more robust solution would be to check if a listener already exists or use a flag.
        btn.removeEventListener('click', handleCloseModal); // Remove existing to be safe if re-running
        btn.addEventListener('click', handleCloseModal);
    });

    if (elements.cancelActionBtn) { // Confirmation modal's cancel button
        // elements.cancelActionBtn.addEventListener('click', () => closeModal('confirmation-modal'));
        elements.cancelActionBtn.addEventListener('click', () => handleOpenModal('confirmation-modal')); // Actually, this would be closeModal
        console.log("Confirmation modal cancel button attached. Calls 'closeModal' from ui.js");
    }
    // Note: confirmActionBtn's onclick is set dynamically in the original code.

    // Other static buttons
    if (elements.startCultivationBtn) {
        // elements.startCultivationBtn.addEventListener('click', startCultivation); // from game-logic.js
        elements.startCultivationBtn.addEventListener('click', () => console.log("Start Cultivation clicked. Call 'startCultivation' from game-logic.js"));
    }
    if (elements.addAllToTempBackpackBtn) {
        // elements.addAllToTempBackpackBtn.addEventListener('click', addAllTrainingItemsToBackpack); // from game-logic.js
        elements.addAllToTempBackpackBtn.addEventListener('click', () => console.log("Add All Training Items clicked. Call 'addAllTrainingItemsToBackpack' from game-logic.js"));
    }
    if (elements.reminderConfirmCloseBtn) {
        // elements.reminderConfirmCloseBtn.addEventListener('click', closeTrainingResultsAndCheckReminder); // from game-logic.js
        elements.reminderConfirmCloseBtn.addEventListener('click', () => console.log("Reminder Confirm Close clicked. Call 'closeTrainingResultsAndCheckReminder' from game-logic.js"));
    }

    // Inputs
    if (elements.newbieGuideSearchInput) {
        // elements.newbieGuideSearchInput.addEventListener('input', (e) => populateNewbieGuide(e.target.value));
        elements.newbieGuideSearchInput.addEventListener('input', (e) => console.log(`Newbie search: ${e.target.value}. Call 'populateNewbieGuide' from ui.js`));
    }
    if (elements.friendsListSearchInput) {
        let friendsSearchDebounceTimer;
        elements.friendsListSearchInput.addEventListener('input', (e) => {
            clearTimeout(friendsSearchDebounceTimer);
            friendsSearchDebounceTimer = setTimeout(() => {
                // searchFriends(e.target.value); // from game-logic.js
                console.log(`Friends search: ${e.target.value}. Call 'searchFriends' from game-logic.js`);
            }, 300);
        });
    }

    // Initialize Drag and Drop listeners (assuming setupDropZones is imported from ui.js or drag-drop.js)
    // setupDropZones();
    console.log("Call 'setupDropZones' here (from ui.js or dedicated drag-drop.js)");

    console.log('Static event listeners initialized from event-handlers.js');
}

/**
 * NOTE ON DYNAMICALLY CREATED ELEMENTS:
 * Event listeners for elements that are created dynamically (e.g., items in inventory,
 * farm list, DNA draw results, leaderboard rows) need to be attached either:
 * 1. When those elements are created (often within the 'populate...' functions in ui.js or game-logic.js).
 * 2. Using event delegation: Attach a listener to a static parent container and then
 * check `event.target` to determine if the click/event originated from a dynamic child
 * element of interest. This is more efficient for large lists.
 *
 * Example of dynamic listener setup (would be in ui.js or game-logic.js):
 * function populateInventory() {
 * // ... code to create inventoryItemDiv ...
 * if (item) { // This is a DNA item
 * inventoryItemDiv.addEventListener('dragstart', handleDragStart); // handleDragStart from game-logic.js
 * }
 * if (sourceType === 'temporary' && item) {
 * inventoryItemDiv.addEventListener('click', () => moveFromTempToInventory(index)); // from game-logic.js
 * }
 * // ...
 * drawDnaBtnElement.addEventListener('click', handleDrawDnaButtonClick); // from game-logic.js
 * inventoryItemsContainer.appendChild(drawDnaBtnElement);
 * }
 */
