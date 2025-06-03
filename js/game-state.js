// game-state.js
// 全域狀態集中管理，給所有模組匯入用

import { __app_id } from './firebase-config.js'; 
import { getFirestore, doc, getDoc, setDoc, collection } from 'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js';

const GameState = {
    // --- DOM 元素引用 ---
    elements: {}, 

    // **修正：在 GameState 頂層明確定義 npcMonsters**
    npcMonsters: [], // 確保這個屬性在 GameState 物件上是可寫的

    // --- 遊戲設定 ---
    gameSettings: {
        dna_fragments: [],
        rarities: {},
        skills: {},
        personalities: {},
        titles: [],
        health_conditions: [],
        newbie_guide: [], 
        value_settings: {
            max_farm_slots: 10,
            max_monster_skills: 3,
            max_battle_turns: 30,
            max_temp_backpack_slots: 18, 
            max_inventory_slots: 10,    
            max_combination_slots: 5,   
            element_value_factors: {},
            dna_recharge_conversion_factor: 0.15
        },
        absorption_config: {},
        cultivation_config: {},
        elemental_advantage_chart: {},
        monster_achievements_list: [],
        element_nicknames: {},
        naming_constraints: {},
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
        diamond: 10,
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

    // 庫存和組合槽的顯示數據
    inventoryDisplaySlots: new Array(10).fill(null), 
    temporaryBackpackSlots: new Array(18).fill(null), 
    combinationSlotsData: new Array(5).fill(null), 

    // 模態框相關狀態
    itemToDeleteInfo: null, 

    // Firebase 實例 (將在 main.js 中設置)
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

    allPublicMonsters: [],
    allPublicPlayers: [],

    async loadUserData(uid) {
        console.log(`GameState: 載入使用者數據 for UID: ${uid}`);
        try {
            if (!GameState.db) {
                console.error("GameState: Firestore DB 實例未初始化。無法載入數據。");
                return;
            }

            // 使用 Firestore v8 語法
            const userDocRef = collection(GameState.db, 'artifacts', __app_id, 'users', uid, 'data');

            const playerProfileDoc = await getDoc(doc(userDocRef, 'profile'));
            if (playerProfileDoc.exists()) {
                GameState.playerData = { uid: uid, ...playerProfileDoc.data() };
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
                await setDoc(doc(userDocRef, 'profile'), GameState.playerData);
            }

            const monstersDoc = await getDoc(doc(userDocRef, 'monsters'));
            if (monstersDoc.exists() && monstersDoc.data().list) {
                GameState.farmedMonsters = monstersDoc.data().list;
            } else {
                GameState.farmedMonsters = [];
            }

            const dnaDoc = await getDoc(doc(userDocRef, 'dna'));
            if (dnaDoc.exists() && dnaDoc.data().list) {
                GameState.playerOwnedDNA = dnaDoc.data().list;
            } else {
                GameState.playerOwnedDNA = [];
            }

            const tempBackpackDoc = await getDoc(doc(userDocRef, 'tempBackpack'));
            if (tempBackpackDoc.exists() && tempBackpackDoc.data().list) {
                GameState.temporaryBackpackSlots = tempBackpackDoc.data().list;
            } else {
                GameState.temporaryBackpackSlots = new Array(GameState.NUM_TEMP_BACKPACK_SLOTS).fill(null);
            }

            const comboSlotsDoc = await getDoc(doc(userDocRef, 'combinationSlots'));
            if (comboSlotsDoc.exists() && comboSlotsDoc.data().list) {
                GameState.combinationSlotsData = comboSlotsDoc.data().list;
            } else {
                GameState.combinationSlotsData = new Array(GameState.NUM_COMBINATION_SLOTS).fill(null);
            }

            GameState.currentMonster = GameState.farmedMonsters.length > 0 ? GameState.farmedMonsters[0] : null;

            console.log("GameState: 使用者數據載入完成。", GameState.playerData);
        } catch (error) {
            console.error("GameState: 載入使用者數據失敗：", error);
        }
    },

    async saveUserData() {
        if (!GameState.auth || !GameState.auth.currentUser || !GameState.db) {
            console.warn("GameState: 無使用者登入或 DB 實例未初始化，無法保存數據。");
            return;
        }
        const uid = GameState.auth.currentUser.uid;
        console.log(`GameState: 保存使用者數據 for UID: ${uid}`);
        try {
            // 使用 Firestore v8 語法
            const userDocRef = collection(GameState.db, 'artifacts', __app_id, 'users', uid, 'data');

            await setDoc(doc(userDocRef, 'profile'), GameState.playerData, { merge: true });
            await setDoc(doc(userDocRef, 'monsters'), { list: GameState.farmedMonsters }, { merge: true });
            await setDoc(doc(userDocRef, 'dna'), { list: GameState.playerOwnedDNA }, { merge: true });
            await setDoc(doc(userDocRef, 'tempBackpack'), { list: GameState.temporaryBackpackSlots }, { merge: true });
            await setDoc(doc(userDocRef, 'combinationSlots'), { list: GameState.combinationSlotsData }, { merge: true });

            console.log("GameState: 使用者數據保存成功。");
        } catch (error) {
            console.error("GameState: 保存使用者數據失敗：", error);
        }
    },
};

export { GameState };
