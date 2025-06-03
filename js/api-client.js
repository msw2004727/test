// api-client.js

import { auth, db } from './firebase-config.js';
import { loadDeepSeekApiKey } from './loadApiKey.js';

// --- API Configuration ---
const API_BASE_URL = 'https://d1d5ef45-d04b-4a1c-be4b-64a0680c6847-00-xxpggv06ka2e.sisko.replit.dev/api/MD';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'chat';

async function getAuthHeaders(includeContentType = true) {
    const headers = {};
    if (includeContentType) headers['Content-Type'] = 'application/json';
    if (auth && auth.currentUser) {
        try {
            const idToken = await auth.currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${idToken}`;
        } catch (error) {
            console.warn("無法獲取 Firebase Token：", error);
        }
    }
    return headers;
}

// --- 遊戲後端 API ---
export async function fetchGameConfigsAPI() {
    const res = await fetch(`${API_BASE_URL}/game-configs`);
    if (!res.ok) throw new Error(`遊戲設定載入失敗：${res.status}`);
    return res.json();
}

export async function getPlayerAPI(userId) {
    const headers = await getAuthHeaders(false);
    const res = await fetch(`${API_BASE_URL}/player/${userId}`, { headers });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status !== 404 || !errorData.playerStats) {
            throw new Error(errorData.error || `獲取玩家資料失敗：${res.status}`);
        }
        return errorData;
    }
    return res.json();
}

export async function combineDNA_API(dna_ids) {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) throw new Error("請先登入再進行 DNA 組合。");
    const res = await fetch(`${API_BASE_URL}/combine`, {
        method: 'POST', headers, body: JSON.stringify({ dna_ids })
    });
    if (!res.ok) throw new Error(`DNA 組合失敗：${res.status}`);
    return res.json();
}

export async function simulateBattleAPI(monster1_data, monster2_data) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/battle/simulate`, {
        method: 'POST', headers, body: JSON.stringify({ monster1_data, monster2_data })
    });
    if (!res.ok) throw new Error(`戰鬥模擬失敗：${res.status}`);
    return res.json();
}

export async function searchPlayersAPI(nicknameQuery, limit = 10) {
    const headers = await getAuthHeaders(false);
    const res = await fetch(`${API_BASE_URL}/players/search?nickname=${encodeURIComponent(nicknameQuery)}&limit=${limit}`, { headers });
    if (!res.ok) throw new Error(`搜尋玩家失敗：${res.status}`);
    return res.json();
}

// --- DeepSeek AI ---
export async function generateAIDescriptionsAPI(monsterData) {
    const apiKey = await loadDeepSeekApiKey();
    if (!apiKey) throw new Error("DeepSeek API Key 載入失敗");

    const prompt = `
請為一隻名為「${monsterData.nickname}」的怪獸，生成詳細的中文描述性文字。它的基本資料如下：
- 屬性：${monsterData.elements.join('、')}
- 稀有度：${monsterData.rarity}
- 生命值(HP)：約 ${monsterData.hp}
- 魔力值(MP)：約 ${monsterData.mp}
- 攻擊力：約 ${monsterData.attack}
- 防禦力：約 ${monsterData.defense}
- 速度：約 ${monsterData.speed}
- 爆擊率：約 ${monsterData.crit}%
- 個性名稱：${monsterData.personality_name}

請依據上述內容，以 JSON 格式回傳三段文字欄位：
1. personality_text：個性描述（至少 100 字）
2. introduction_text：背景介紹與能力描寫（至少 150 字）
3. evaluation_text：綜合評價與養成建議（至少 200 字）
`;

    const payload = {
        model: DEFAULT_MODEL,
        messages: [
            { role: "system", content: "你是怪獸養成遊戲的敘述設計師。" },
            { role: "user", content: prompt }
        ],
        temperature: 0.8
    };

    const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`DeepSeek API 失敗：${response.status} - ${text}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    try {
        return JSON.parse(content);
    } catch {
        throw new Error("DeepSeek 回傳格式無法解析為 JSON");
    }
}
