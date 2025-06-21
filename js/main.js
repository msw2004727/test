// js/main.js

/**
 * 清除暫存，在使用者關閉或刷新頁面時執行。
 */
function clearGameCacheOnExitOrRefresh() {
    console.log("正在清除遊戲暫存...");
    sessionStorage.clear();
    localStorage.removeItem('announcementShown_v1');
}

/**
 * 初始化 Firebase 應用。
 */
function initializeFirebaseApp() {
    if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
        try {
            if (!firebase.apps.length) { 
                firebase.initializeApp(firebaseConfig);
                console.log("Firebase App 已成功初始化。");
            } else {
                console.log("Firebase App 已被初始化。");
            }
        } catch (error) {
            console.error("Firebase 初始化錯誤:", error);
            if (typeof showFeedbackModal === 'function') {
                showFeedbackModal('嚴重錯誤', '無法初始化遊戲核心服務，請稍後再試或聯繫管理員。');
            }
        }
    } else {
        console.error("Firebase 或 firebaseConfig 未定義。請確保 firebase-config.js 已載入。");
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red; font-size: 1.2em;">遊戲載入失敗：缺少必要的 Firebase 設定。</div>';
    }
}

/**
 * 載入並顯示遊戲公告。
 */
async function loadAndDisplayAnnouncement() {
    try {
        const response = await fetch('./announcement.json');
        if (!response.ok) throw new Error('無法讀取公告檔案。');
        
        const announcementData = await response.json();
        const titleElement = document.querySelector('#official-announcement-modal .modal-header');
        const contentContainer = document.getElementById('announcement-content');

        if (titleElement && contentContainer) {
            titleElement.textContent = announcementData.title || "📢 遊戲官方公告";
            
            let contentHtml = `<p>${announcementData.greeting || '親愛的'}<span id="announcement-player-name" class="font-bold text-[var(--accent-color)]">玩家</span>您好，</p>`;
            (announcementData.contentBlocks || []).forEach(block => {
                switch (block.type) {
                    case 'paragraph':
                        contentHtml += `<p>${block.text}</p>`;
                        break;
                    case 'image':
                        contentHtml += `<div class="announcement-image-container"><img src="${block.src}" alt="${block.alt || '公告圖片'}"></div>`;
                        break;
                    case 'columns':
                        contentHtml += `<div class="announcement-columns-container">`;
                        (block.columns || []).forEach(column => {
                            contentHtml += `<div class="announcement-column"><h5>${column.title}</h5><ul>`;
                            (column.items || []).forEach(item => {
                                const colorClass = `text-color-${item.color || 'default'}`;
                                contentHtml += `<li><span class="${colorClass}">${item.text}</span></li>`;
                            });
                            contentHtml += `</ul></div>`;
                        });
                        contentHtml += `</div>`;
                        break;
                }
            });
            contentHtml += `<p style="text-align: right; margin-top: 20px; color: var(--rarity-legendary-text); font-weight: bold;">${announcementData.closing || '遊戲團隊 敬上'}</p>`;
            contentContainer.innerHTML = contentHtml;
            updateAnnouncementPlayerName(gameState.playerNickname);
        }
    } catch (error) {
        console.error('讀取或顯示公告時發生錯誤:', error);
    }
}

/**
 * 初始化整個遊戲。
 */
async function initializeGame() {
    console.log("Initializing game...");
    showFeedbackModal('遊戲載入中...', '正在準備您的怪獸異世界...', true);

    try {
        if (!gameState.currentUser) {
            console.log("無使用者登入，中止遊戲初始化。");
            toggleElementDisplay(DOMElements.authScreen, true, 'flex');
            toggleElementDisplay(DOMElements.gameContainer, false);
            hideModal('feedback-modal');
            return;
        }

        const [configs, playerData, assetPaths, uiTextContent, chatGreetings] = await Promise.all([
            getGameConfigs(),
            getPlayerData(gameState.currentUser.uid),
            fetch('./assets.json').then(res => res.json()),
            fetch('./ui_text.json').then(res => res.json()),
            fetch('./chat_greetings.json').then(res => res.json())
        ]);
        
        if (!configs || !playerData || !assetPaths || !uiTextContent || !chatGreetings) {
            throw new Error("一項或多項核心遊戲設定檔載入失敗。");
        }

        updateGameState({
            gameConfigs: configs,
            playerData: playerData,
            assetPaths: assetPaths,
            uiTextContent: uiTextContent,
            chatGreetings: chatGreetings,
            playerNickname: playerData.nickname || gameState.currentUser.displayName || "玩家"
        });

        populateImageAssetSources();
        if (DOMElements.maxCultivationTimeText && configs.value_settings) {
            DOMElements.maxCultivationTimeText.textContent = configs.value_settings.max_cultivation_time_seconds || 3600;
        }
        updatePlayerCurrencyDisplay(playerData.playerStats.gold || 0);
        updateMailNotificationDot(playerData.mailbox || []);
        
        renderPlayerDNAInventory();
        renderDNACombinationSlots();
        renderMonsterFarm();
        renderTemporaryBackpack();
        
        loadAndDisplayAnnouncement();

        const defaultMonster = getDefaultSelectedMonster();
        setTimeout(() => updateMonsterSnapshot(defaultMonster || null), 100);

        toggleElementDisplay(DOMElements.authScreen, false);
        toggleElementDisplay(DOMElements.gameContainer, true, 'flex');
        
        hideModal('feedback-modal');
        checkAndShowNewTitleModal(playerData);

    } catch (error) {
        console.error("遊戲初始化失敗:", error);
        hideModal('feedback-modal');
        const logoutButton = {
            text: '重新登入',
            class: 'primary',
            onClick: async () => { await logoutUser(); }
        };
        showFeedbackModal('遊戲載入失敗', `初始化過程中發生錯誤：${error.message}。請嘗試刷新頁面或重新登入。`, false, null, [logoutButton, { text: '關閉', class: 'secondary' }]);
        toggleElementDisplay(DOMElements.authScreen, true, 'flex');
        toggleElementDisplay(DOMElements.gameContainer, false);
    }
}

/**
 * Firebase 驗證狀態改變時的處理函數。
 * @param {firebase.User | null} user - 當前的 Firebase 使用者物件，或 null。
 */
async function onAuthStateChangedHandler(user) {
    if (Object.keys(DOMElements).length === 0) {
        setTimeout(() => onAuthStateChangedHandler(user), 100);
        return;
    }

    if (user) {
        console.log("使用者已登入:", user.uid);
        updateGameState({ currentUser: user, playerId: user.uid, playerNickname: user.displayName || "玩家" });
        await initializeGame();
        if (localStorage.getItem('announcementShown_v1') !== 'true') {
            showModal('official-announcement-modal');
        }
    } else {
        console.log("使用者已登出或未登入。");
        updateGameState({ currentUser: null, playerId: null, playerNickname: "玩家", playerData: null, gameConfigs: null });
        toggleElementDisplay(DOMElements.authScreen, true, 'flex');
        toggleElementDisplay(DOMElements.gameContainer, false);
        setTimeout(() => {
            updateMonsterSnapshot(null);
            resetDNACombinationSlots();
            renderPlayerDNAInventory();
            renderTemporaryBackpack();
            hideAllModals();
        }, 100);
    }
}

/**
 * 嘗試初始化所有應用程式組件。
 * 會檢查所有必要的初始化函數是否都已定義，然後才執行。
 */
function attemptToInitializeApp() {
    const requiredFunctions = [
        'initializeDOMElements', 'RosterAuthListener', 'initializeUIEventHandlers',
        'initializeGameInteractionEventHandlers', 'initializeDragDropEventHandlers',
        'initializeMonsterEventHandlers', 'initializeNoteHandlers', 'initializeChatSystem',
        'initializeMailboxSystem'
    ];
    
    const undefinedFunctions = requiredFunctions.filter(fnName => typeof window[fnName] !== 'function');

    if (undefinedFunctions.length === 0) {
        console.log("所有核心函式已準備就緒，開始初始化應用程式。");
        initializeDOMElements();
        initializeTheme();
        initializeFirebaseApp();
        RosterAuthListener(onAuthStateChangedHandler);

        // 初始化所有事件監聽器
        initializeUIEventHandlers();
        initializeGameInteractionEventHandlers();
        initializeDragDropEventHandlers();
        initializeMonsterEventHandlers();
        initializeNoteHandlers();
        initializeChatSystem();
        initializeMailboxSystem(); 

        setInterval(updateAllTimers, 1000);

        // 預設顯示第一個分頁
        if (DOMElements.dnaFarmTabs && DOMElements.dnaFarmTabs.querySelector('.tab-button[data-tab-target="dna-inventory-content"]')) {
            switchTabContent('dna-inventory-content', DOMElements.dnaFarmTabs.querySelector('.tab-button[data-tab-target="dna-inventory-content"]'));
        }
    } else {
        console.warn(`一個或多個核心初始化函式尚未定義: [${undefinedFunctions.join(', ')}]，將在 100ms 後重試...`);
        setTimeout(attemptToInitializeApp, 100);
    }
}


// --- 程式進入點 ---
document.addEventListener('DOMContentLoaded', attemptToInitializeApp);
window.addEventListener('beforeunload', clearGameCacheOnExitOrRefresh);

console.log("Main.js script loaded.");
