// js/ui-adventure.js
// 專門負責渲染「冒險島」的所有UI，包括全景地圖、派遣隊伍視窗、探索地圖等。

let adventureDOMElements = {};

/**
 * 初始化「冒險島」頁籤所需的 DOM 元素。
 */
function initializeAdventureDOMElements() {
    adventureDOMElements = {
        // 「冒險島」頁籤的主內容容器，在 index.html 中對應的 ID 是 guild-content
        adventureTabContent: document.getElementById('guild-content'),
    };
}

/**
 * 【偵錯用】渲染一個簡單的測試區塊來確認容器是否可見。
 */
function renderAdventureIsland() {
    const adventureTabContent = document.getElementById('guild-content');
    if (!adventureTabContent) {
        console.error("冒險島的內容容器 'guild-content' 未找到。");
        return;
    }

    // 強制設定樣式，確保容器可見
    adventureTabContent.style.display = 'flex';
    adventureTabContent.innerHTML = ''; // 清空

    // 建立一個簡單的測試 div
    const testBox = document.createElement('div');
    testBox.style.width = '100%';
    testBox.style.height = '100%'; // 讓它嘗試填滿父容器
    testBox.style.backgroundColor = 'blue'; // 使用明顯的顏色
    testBox.style.color = 'white';
    testBox.style.display = 'flex';
    testBox.style.alignItems = 'center';
    testBox.style.justifyContent = 'center';
    testBox.style.fontSize = '2rem';
    testBox.textContent = '測試內容';

    adventureTabContent.appendChild(testBox);
    console.log("已渲染測試用的藍色方塊。");
}


/**
 * 初始化冒險島UI的總入口函式。
 * 當玩家點擊「冒險島」頁籤時，這個函式會被觸發。
 */
function initializeAdventureUI() {
    initializeAdventureDOMElements();
    renderAdventureIsland();
}
