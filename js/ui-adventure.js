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
 * 【偵錯步驟 3】為網格容器套用 grid 佈局，但不加入內容。
 */
function renderAdventureIsland() {
    const adventureTabContent = document.getElementById('guild-content');
    if (!adventureTabContent) {
        console.error("冒險島的內容容器 'guild-content' 未找到。");
        return;
    }

    adventureTabContent.style.display = 'flex';
    adventureTabContent.innerHTML = ''; // 清空

    // 步驟 1: 建立綠色的地圖容器 (已知可運作)
    const islandContainer = document.createElement('div');
    islandContainer.style.height = '100%';
    islandContainer.style.width = '100%';
    islandContainer.style.backgroundColor = 'green';
    islandContainer.style.position = 'relative'; 

    // 步驟 2: 建立紅色網格容器 (已知可運作)
    const gridOverlay = document.createElement('div');
    gridOverlay.style.position = 'absolute';
    gridOverlay.style.top = '0';
    gridOverlay.style.left = '0';
    gridOverlay.style.width = '100%';
    gridOverlay.style.height = '100%';
    gridOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    gridOverlay.style.border = '2px dashed white';
    
    // 【核心測試】為這個紅色容器套上 grid 佈局
    gridOverlay.style.display = 'grid';
    gridOverlay.style.gridTemplateColumns = 'repeat(5, 1fr)';
    gridOverlay.style.gridTemplateRows = 'repeat(5, 1fr)';
    gridOverlay.style.gap = '4px';
    gridOverlay.style.padding = '4px';
    gridOverlay.style.boxSizing = 'border-box';

    // 注意：我們故意不加入任何子元素 (格子和按鈕) 到這個網格中
    
    islandContainer.appendChild(gridOverlay);
    adventureTabContent.appendChild(islandContainer);

    console.log("偵錯步驟3：已渲染紅色網格容器，並套用 grid 佈局。");
}


/**
 * 初始化冒險島UI的總入口函式。
 */
function initializeAdventureUI() {
    initializeAdventureDOMElements();
    renderAdventureIsland();
}
