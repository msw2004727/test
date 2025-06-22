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
 * 【偵錯步驟 2】在正常的地圖容器內，加入網格容器進行測試。
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

    // 步驟 1: 建立綠色的地圖容器 (我們已知這部分可正常運作)
    const islandContainer = document.createElement('div');
    islandContainer.style.height = '100%';
    islandContainer.style.width = '100%';
    islandContainer.style.backgroundColor = 'green';
    islandContainer.style.position = 'relative'; // 這是為了讓子層的 absolute 定位生效
    islandContainer.style.display = 'flex';
    islandContainer.style.alignItems = 'center';
    islandContainer.style.justifyContent = 'center';
    islandContainer.style.color = 'white';
    islandContainer.textContent = '地圖容器';
    islandContainer.style.fontSize = '2rem';

    // 步驟 2: 建立網格容器並疊加上去
    const gridOverlay = document.createElement('div');
    gridOverlay.style.position = 'absolute';
    gridOverlay.style.top = '10px'; // 稍微內縮一點，方便觀察
    gridOverlay.style.left = '10px';
    gridOverlay.style.right = '10px';
    gridOverlay.style.bottom = '10px';
    gridOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // 半透明紅色，以便觀察疊加效果
    gridOverlay.style.border = '2px dashed white';
    
    // 加入測試文字
    gridOverlay.textContent = '網格容器測試';
    gridOverlay.style.color = 'white';
    gridOverlay.style.display = 'flex';
    gridOverlay.style.alignItems = 'center';
    gridOverlay.style.justifyContent = 'center';
    gridOverlay.style.fontSize = '2rem';

    // 將網格容器加入地圖容器中
    islandContainer.appendChild(gridOverlay);
    
    // 最後將地圖容器加入到頁籤內容中
    adventureTabContent.appendChild(islandContainer);

    console.log("偵錯步驟2：已渲染綠色地圖容器，並疊加上紅色網格容器。");
}


/**
 * 初始化冒險島UI的總入口函式。
 */
function initializeAdventureUI() {
    initializeAdventureDOMElements();
    renderAdventureIsland();
}
