// api-client.js

/**
 * 理想情況下，您會從其他模組導入 Firebase auth 實例:
 * import { auth } from './firebase-config.js';
 */
// 為了此範例的獨立性，假設 auth 變數在某處可用 (例如全域或從其他模組傳入)
// 在實際模組化中，您應該明確導入它。
// const auth = firebase.auth(); // 假設 firebase 已初始化

// --- API Configuration ---
const API_BASE_URL = 'https://d1d5ef45-d04b-4a1c-be4b-64a0680c6847-00-xxpggv06ka2e.sisko.replit.dev/api/MD';

// Google Gemini API (用於怪獸描述生成)
const GEMINI_API_KEY = ""; // 依照指示，API 金鑰留空，由 Canvas 環境提供或外部設定
const GEMINI_API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";


// --- Helper Function for Authenticated Requests ---
async function getAuthHeaders(includeContentType = true) {
    const headers = {};
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    // 假設 auth 是從 firebase-config.js 導入的 Firebase auth 實例
    // 在實際應用中，確保 auth 變數在此作用域內可用。
    if (typeof auth !== 'undefined' && auth && auth.currentUser) {
        try {
            const idToken = await auth.currentUser.getIdToken();
            if (idToken) {
                headers['Authorization'] = `Bearer ${idToken}`;
            }
        } catch (error) {
            console.warn("無法獲取 ID Token (使用者可能未登入):", error);
        }
    } else {
        console.warn("Auth object is not available or user is not logged in for getAuthHeaders.");
    }
    return headers;
}

// --- API Client Functions for Your Backend ---

/**
 * 獲取遊戲核心設定
 * @returns {Promise<Object>} 遊戲設定物件
 */
export async function fetchGameConfigsAPI() {
    const response = await fetch(`${API_BASE_URL}/game-configs`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `獲取遊戲設定失敗，狀態碼: ${response.status}` }));
        console.error("fetchGameConfigsAPI error:", errorData.error);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

/**
 * 獲取玩家遊戲資料
 * @param {string} userId - 玩家的 UID
 * @returns {Promise<Object>} 玩家資料物件
 */
export async function getPlayerAPI(userId) {
    const headers = await getAuthHeaders(false); // GET 請求通常不需要 Content-Type
    const response = await fetch(`${API_BASE_URL}/player/${userId}`, { headers });
    if (!response.ok) {
        // 如果是 404 (找不到玩家)，後端服務層會處理初始化，所以這裡不一定總是錯誤
        if (response.status === 404) {
            console.warn(`Player ${userId} not found on backend, service layer might initialize.`);
            // 根據您的後端邏輯，404 可能表示新玩家，並由後端處理初始化
            // 如果後端不處理初始化，則這裡應該拋出錯誤或返回特定值
        }
        // 即使是 404，也嘗試解析 JSON，因為後端可能返回了包含錯誤訊息的 JSON
        const errorData = await response.json().catch(() => ({ error: `獲取玩家資料失敗 (${userId})，狀態碼: ${response.status}` }));
        // 如果不是 404，或者即使是 404 但後端沒有成功初始化並返回玩家資料，則拋出錯誤
        if (response.status !== 404 || !errorData.playerStats) { // 假設初始化成功後會返回 playerStats
             console.error("getPlayerAPI error:", errorData.error);
             throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return errorData; // 如果是404且後端返回了初始化的資料結構
    }
    return response.json();
}

/**
 * 組合 DNA 以創建怪獸
 * @param {string[]} dna_ids - 用於組合的 DNA ID 列表
 * @returns {Promise<Object>} 新創建的怪獸物件或錯誤訊息
 */
export async function combineDNA_API(dna_ids) {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
        throw new Error("未授權：無法組合 DNA，請先登入。");
    }
    const response = await fetch(`${API_BASE_URL}/combine`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ dna_ids: dna_ids })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `DNA 組合請求失敗，狀態碼: ${response.status}` }));
        console.error("combineDNA_API error:", errorData.error);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

/**
 * 模擬兩隻怪獸之間的戰鬥
 * @param {Object} monster1_data - 怪獸1的資料
 * @param {Object} monster2_data - 怪獸2的資料
 * @returns {Promise<Object>} 戰鬥結果物件
 */
export async function simulateBattleAPI(monster1_data, monster2_data) {
    const headers = await getAuthHeaders(); // 戰鬥可能需要驗證以記錄玩家戰績
    const response = await fetch(`${API_BASE_URL}/battle/simulate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            monster1_data: monster1_data,
            monster2_data: monster2_data
        })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `戰鬥模擬請求失敗，狀態碼: ${response.status}` }));
        console.error("simulateBattleAPI error:", errorData.error);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

/**
 * 根據暱稱搜尋玩家
 * @param {string} nicknameQuery - 搜尋的暱稱關鍵字
 * @param {number} limit - 返回結果的數量上限
 * @returns {Promise<Object>} 包含玩家列表的物件
 */
export async function searchPlayersAPI(nicknameQuery, limit = 10) {
    const headers = await getAuthHeaders(false); // 搜尋通常是公開的，但如果需要也可以加上驗證
    const response = await fetch(`${API_BASE_URL}/players/search?nickname=${encodeURIComponent(nicknameQuery)}&limit=${limit}`, { headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `搜尋玩家失敗，狀態碼: ${response.status}` }));
        console.error("searchPlayersAPI error:", errorData.error);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}


// --- Google Gemini API Client Function ---

/**
 * 為怪獸生成 AI 描述、個性和評價
 * @param {Object} monsterDataForPrompt - 用於生成提示的怪獸資料
 * @returns {Promise<Object>} 包含 AI 生成內容的物件
 */
export async function generateAIDescriptionsAPI(monsterDataForPrompt) {
    const prompt = `
請為一隻名為「${monsterDataForPrompt.nickname}」的怪獸，生成詳細的中文描述性文字。它的基本資料如下：
- 屬性：${monsterDataForPrompt.elements.join('、')}
- 稀有度：${monsterDataForPrompt.rarity}
- 生命值(HP)：約 ${monsterDataForPrompt.hp}
- 魔力值(MP)：約 ${monsterDataForPrompt.mp}
- 攻擊力：約 ${monsterDataForPrompt.attack}
- 防禦力：約 ${monsterDataForPrompt.defense}
- 速度：約 ${monsterDataForPrompt.speed}
- 爆擊率：約 ${monsterDataForPrompt.crit}%
- 個性名稱：${monsterDataForPrompt.personality_name}

請嚴格按照以下JSON格式提供回應，不要添加任何額外的解釋或開頭/結尾文字，並確保每個欄位的文本長度符合要求：

{
  "personality_text": "一段關於「${monsterDataForPrompt.nickname}」個性的詳細描述。這段描述應基於其個性名稱「${monsterDataForPrompt.personality_name}」，進行生動、形象的闡述，深入挖掘其性格特點、行為傾向以及與訓練師可能的互動方式。請確保文本長度至少100個中文字元。",
  "introduction_text": "一段關於「${monsterDataForPrompt.nickname}」的背景故事或趣味介紹。這段介紹應至少150個中文字元，並巧妙地將其所有基礎數值（HP: ${monsterDataForPrompt.hp}, MP: ${monsterDataForPrompt.mp}, 攻擊力: ${monsterDataForPrompt.attack}, 防禦力: ${monsterDataForPrompt.defense}, 速度: ${monsterDataForPrompt.speed}, 爆擊率: ${monsterDataForPrompt.crit}%, 屬性: ${monsterDataForPrompt.elements.join('、')}, 稀有度: ${monsterDataForPrompt.rarity}）自然地融入到敘述中，讓讀者對它的能力有一個全面的初步印象。例如，可以描述它的體型、外貌特徵如何反映其HP和防禦，它的敏捷程度如何體現其速度，它的攻擊方式如何展現其攻擊力和元素特性等。",
  "evaluation_text": "一段針對「${monsterDataForPrompt.nickname}」的綜合評價與培養建議。此評價應至少200個中文字元，必須結合其「${monsterDataForPrompt.personality_name}」的個性特點，以及其全部數值（HP: ${monsterDataForPrompt.hp}, MP: ${monsterDataForPrompt.mp}, 攻擊力: ${monsterDataForPrompt.attack}, 防禦力: ${monsterDataForPrompt.defense}, 速度: ${monsterDataForPrompt.speed}, 爆擊率: ${monsterDataForPrompt.crit}%, 屬性: ${monsterDataForPrompt.elements.join('、')}, 稀有度: ${monsterDataForPrompt.rarity}）進行全面分析。請指出它的優勢與劣勢，並給出具體的培養方向建議或在隊伍中的戰術定位。"
}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "personality_text": { "type": "STRING" },
                    "introduction_text": { "type": "STRING" },
                    "evaluation_text": { "type": "STRING" }
                },
                required: ["personality_text", "introduction_text", "evaluation_text"]
            },
            temperature: 0.75,
            topP: 0.95,
            topK: 40
        }
    };

    const apiUrl = `${GEMINI_API_URL_BASE}${DEFAULT_GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", response.status, errorText);
        throw new Error(`Gemini API 請求失敗: ${response.status}. ${errorText}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const generatedJsonText = result.candidates[0].content.parts[0].text;
        try {
            return JSON.parse(generatedJsonText);
        } catch (jsonError) {
            console.error("解析 Gemini API 回應中的 JSON 字串失敗:", jsonError, "回應字串:", generatedJsonText);
            throw new Error("AI 未能生成有效的 JSON 描述內容。");
        }
    } else {
        console.error("Gemini API 回應格式不符合預期:", result);
        const promptFeedback = result.promptFeedback;
        let errorDetails = "AI 未能生成有效的描述內容。";
        if (promptFeedback) {
            errorDetails += ` Prompt Feedback: BlockReason='${promptFeedback.blockReason}', SafetyRatings='${promptFeedback.safetyRatings}'.`;
        }
        throw new Error(errorDetails);
    }
}

// 假設的 auth 變數，在實際應用中，您需要從 firebase-config.js 導入
// const auth = firebase.auth(); // 這行應該在 firebase-config.js 中，然後從那裡導入 auth
// 為了讓這個檔案能獨立 (概念上) 運行，我們在這裡模擬一個 auth 物件
// 在實際使用中，請確保 firebase 和 auth 已正確初始化並傳入或導入。
let auth;
if (typeof firebase !== 'undefined' && firebase.auth) { // 檢查 firebase 是否已定義
    auth = firebase.auth();
} else {
    // 模擬一個 auth 物件，如果 firebase 未初始化
    auth = {
        currentUser: null // 或者一個帶有 getIdToken 方法的模擬使用者物件
    };
    console.warn("Firebase auth object is not available in api-client.js. Using a mock. Ensure Firebase is initialized and auth is imported/passed correctly.");
}
