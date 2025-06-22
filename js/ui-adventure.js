// js/ui-adventure.js
// 專門負責渲染「冒險島」的所有UI，包括全景地圖、派遣隊伍視窗、探索地圖等。

let adventureDOMElements = {};

/**
 * 初始化「冒險島」頁籤所需的 DOM 元素。
 */
function initializeAdventureDOMElements() {
    adventureDOMElements = {
        adventureTabContent: document.getElementById('guild-content'),
    };
}

/**
 * 【偵錯步驟 1】只渲染地圖容器，並使用背景色代替背景圖。
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

    // 建立地圖容器
    const islandContainer = document.createElement('div');
    
    // 直接用 JS 設定樣式，模仿我們成功的藍色方塊測試
    islandContainer.style.height = '100%';
    islandContainer.style.width = '100%';
    islandContainer.style.backgroundColor = 'green'; // 使用純色背景來測試
    
    // 加入測試文字以確保容器不僅有尺寸，還有內容
    islandContainer.textContent = '地圖容器測試'; 
    islandContainer.style.color = 'white';
    islandContainer.style.display = 'flex';
    islandContainer.style.alignItems = 'center';
    islandContainer.style.justifyContent = 'center';
    islandContainer.style.fontSize = '2rem';

    // 將地圖容器加入到頁籤內容中
    adventureTabContent.appendChild(islandContainer);

    console.log("偵錯步驟1：已渲染測試用的綠色地圖容器。");
}


/**
 * 初始化冒險島UI的總入口函式。
 * 當玩家點擊「冒險島」頁籤時，這個函式會被觸發。
 */
function initializeAdventureUI() {
    initializeAdventureDOMElements();
    renderAdventureIsland();
}
