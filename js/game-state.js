// game-state.js
// 全域狀態集中管理，給所有模組匯入用

const GameState = {
    // --- DOM 元素引用 ---
    // 將 elements 物件的初始化延遲到一個函式調用，確保它是可寫的副本
    // 在這裡，我們只是定義一個空物件作為初始值。
    // main.js 中的 initializeDOMReferences 會負責填充它。
    elements: {}, // 這裡不需要給它賦值任何東西，只是定義一個空的物件。

    // --- 遊戲設定 ---
    gameSettings: {
        dnaFragments: [],
        rarities: {},
        skills: {},
        personalities: {},
        titles: [],
        healthConditions: [],
        newbie_guide: [],
        value_settings: {
            max_farm_slots: 10,
            max_monster_skills: 3,
            max_battle_turns: 30,
            max_temp_backpack_slots: 18,
            max_inventory_slots: 10,
            max_combination_slots: 5,
        },
        npc_monsters: [],
    },

    // --- 玩家數據 ---
    currentLoggedInUser: null,
    playerData: {
        uid: null,
        nickname: null,
        email: null,
        wins: 0,
        losses: 0,
        gold: 0,
        diamond: 0,
        achievements: [],
        ownedMonsters: [],
        playerOwnedDNA: [],
        temporaryBackpackSlots: [],
        combinationSlotsData: [],
    },

    // --- 遊戲狀態數據 ---
    currentMonster: null,
    farmedMonsters: [],
    battlingMonsterId: null,
    itemsFromCurrentTraining: [],
    monsterToReleaseInfo: null,
    monsterToChallengeInfo: null,
    currentCultivationMonster: null,

    // 庫存和組合槽的顯示數據 (與 playerData.playerOwnedDNA 和 playerData.combinationSlotsData 同步)
    inventoryDisplaySlots: new Array(10).fill(null),
    temporaryBackpackSlots: new Array(18).fill(null),
    combinationSlotsData: new Array(5).fill(null),

    // 模態框相關狀態
    itemToDeleteInfo: null,

    // Firebase 實例 (由 main.js 注入)
    auth: null,
    db: null,
    firebaseApp: null,

    // 常量
    MAX_FARM_SLOTS: 10,
    NUM_TEMP_BACKPACK_SLOTS: 18,
    NUM_INVENTORY_SLOTS: 10,
    NUM_COMBINATION_SLOTS: 5,
    MAX_CULTIVATION_SECONDS: 999,
    newbieGuideData: [],

    // --- 數據載入函式 (應該在 auth.js 登入成功後呼叫) ---
    async loadUserData(uid) {
        console.log(`GameState: 載入使用者數據 for UID: ${uid}`);
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

            const playerDocRef = GameState.db.collection('artifacts').doc(appId).collection('users').doc(uid).collection('data').doc('profile');
            const playerDoc = await playerDocRef.get();
            if (playerDoc.exists) {
                GameState.playerData = { uid: uid, ...playerDoc.data() };
            } else {
                console.warn(`GameState: 找不到使用者 ${uid} 的個人資料，將使用預設值。`);
                GameState.playerData = {
                    uid: uid,
                    nickname: `玩家_${uid.substring(0, 5)}`,
                    wins: 0,
                    losses: 0,
                    gold: 100,
                    diamond: 10,
                    achievements: [],
                    ownedMonsters: [],
                    playerOwnedDNA: new Array(GameState.NUM_INVENTORY_SLOTS).fill(null),
                    temporaryBackpackSlots: new Array(GameState.NUM_TEMP_BACKPACK_SLOTS).fill(null),
                    combinationSlotsData: new Array(GameState.NUM_COMBINATION_SLOTS).fill(null),
                };
                await playerDocRef.set(GameState.playerData);
            }

            const monstersDocRef = GameState.db.collection('artifacts').doc(appId).collection('users').doc(uid).collection('data').doc('monsters');
            const monstersDoc = await monstersDocRef.get();
            if (monstersDoc.exists && monstersDoc.data().list) {
                GameState.farmedMonsters = monstersDoc.data().list;
            } else {
                GameState.farmedMonsters = [];
            }

            const dnaDocRef = GameState.db.collection('artifacts').doc(appId).collection('users').doc(uid).collection('data').doc('dna');
            const dnaDoc = await dnaDocRef.get();
            if (dnaDoc.exists && dnaDoc.data().list) {
                GameState.playerData.playerOwnedDNA = dnaDoc.data().list.concat(new Array(GameState.NUM_INVENTORY_SLOTS).fill(null)).slice(0, GameState.NUM_INVENTORY_SLOTS);
            } else {
                GameState.playerData.playerOwnedDNA = new Array(GameState.NUM_INVENTORY_SLOTS).fill(null);
            }

            const tempBackpackRef = GameState.db.collection('artifacts').doc(appId).collection('users').doc(uid).collection('data').doc('tempBackpack');
            const tempBackpackDoc = await tempBackpackRef.get();
            if (tempBackpackDoc.exists && tempBackpackDoc.data().list) {
                GameState.playerData.temporaryBackpackSlots = tempBackpackDoc.data().list.concat(new Array(GameState.NUM_TEMP_BACKPACK_SLOTS).fill(null)).slice(0, GameState.NUM_TEMP_BACKPACK_SLOTS);
            } else {
                GameState.playerData.temporaryBackpackSlots = new Array(GameState.NUM_TEMP_BACKPACK_SLOTS).fill(null);
            }

            const comboSlotsRef = GameState.db.collection('artifacts').doc(appId).collection('users').doc(uid).collection('data').doc('combinationSlots');
            const comboSlotsDoc = await comboSlotsRef.get();
            if (comboSlotsDoc.exists && comboSlotsDoc.data().list) {
                GameState.playerData.combinationSlotsData = comboSlotsDoc.data().list.concat(new Array(GameState.NUM_COMBINATION_SLOTS).fill(null)).slice(0, GameState.NUM_COMBINATION_SLOTS);
            } else {
                GameState.playerData.combinationSlotsData = new Array(GameState.NUM_COMBINATION_SLOTS).fill(null);
            }

            GameState.inventoryDisplaySlots = GameState.playerData.playerOwnedDNA;
            GameState.temporaryBackpackSlots = GameState.playerData.temporaryBackpackSlots;
            GameState.combinationSlotsData = GameState.playerData.combinationSlotsData;

            GameState.currentMonster = GameState.farmedMonsters.length > 0 ? GameState.farmedMonsters[0] : null;

            console.log("GameState: 使用者數據載入完成。", GameState.playerData);
        } catch (error) {
            console.error("GameState: 載入使用者數據失敗：", error);
        }
    },

    // --- 數據保存函式 (用於將 GameState 中的數據保存到 Firestore) ---
    async saveUserData() {
        if (!GameState.auth || !GameState.auth.currentUser) {
            console.warn("GameState: 無使用者登入，無法保存數據。");
            return;
        }
        const uid = GameState.auth.currentUser.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        console.log(`GameState: 保存使用者數據 for UID: ${uid}`);
        try {
            const userDocRef = GameState.db.collection('artifacts').doc(appId).collection('users').doc(uid).collection('data');

            await userDocRef.doc('profile').set(GameState.playerData, { merge: true });
            await userDocRef.doc('monsters').set({ list: GameState.farmedMonsters }, { merge: true });
            await userDocRef.doc('dna').set({ list: GameState.playerData.playerOwnedDNA }, { merge: true });
            await userDocRef.doc('tempBackpack').set({ list: GameState.playerData.temporaryBackpackSlots }, { merge: true });
            await userDocRef.doc('combinationSlots').set({ list: GameState.playerData.combinationSlotsData }, { merge: true });

            console.log("GameState: 使用者數據保存成功。");
        } catch (error) {
            console.error("GameState: 保存使用者數據失敗：", error);
        }
    },
};

// 導出 GameState 物件
export { GameState };
