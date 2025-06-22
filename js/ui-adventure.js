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
 * 【最終偵錯版#2】渲染冒險島介面，將背景圖改為背景色。
 */
function renderAdventureIsland() {
    const adventureTabContent = document.getElementById('guild-content');
    if (!adventureTabContent) {
        console.error("冒險島的內容容器 'guild-content' 未找到。");
        return;
    }
    
    adventureTabContent.style.display = 'flex';
    adventureTabContent.style.flexDirection = 'column';
    adventureTabContent.style.padding = '0';
    adventureTabContent.innerHTML = '';

    // --- 建立地圖容器並手動設定樣式 ---
    const islandContainer = document.createElement('div');
    islandContainer.style.height = '100%';
    islandContainer.style.width = '100%';
    islandContainer.style.position = 'relative';
    // 【核心修改】將背景圖片改為固定的背景顏色
    islandContainer.style.backgroundColor = 'green'; 
    islandContainer.style.overflow = 'auto';

    // --- 建立網格容器並手動設定樣式 ---
    const gridOverlay = document.createElement('div');
    gridOverlay.style.position = 'absolute';
    gridOverlay.style.top = '0';
    gridOverlay.style.left = '0';
    gridOverlay.style.width = '100%';
    gridOverlay.style.height = '100%';
    gridOverlay.style.display = 'grid';
    gridOverlay.style.gridTemplateColumns = 'repeat(5, 1fr)';
    gridOverlay.style.gridTemplateRows = 'repeat(5, 1fr)';
    gridOverlay.style.gap = '4px';
    gridOverlay.style.padding = '4px';
    gridOverlay.style.boxSizing = 'border-box';

    // --- 產生格子與按鈕 ---
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.style.border = '1px dashed rgba(255, 255, 255, 0.2)';
        cell.style.borderRadius = '8px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';

        const nodeButton = document.createElement('button');
        nodeButton.style.backgroundColor = 'rgba(13, 17, 23, 0.6)';
        nodeButton.style.border = '1px solid #30363d';
        nodeButton.style.color = '#8b949e';
        nodeButton.style.width = '48px';
        nodeButton.style.height = '48px';
        nodeButton.style.borderRadius = '50%';
        nodeButton.style.fontSize = '1.5rem';
        nodeButton.style.cursor = 'pointer';
        nodeButton.style.display = 'flex';
        nodeButton.style.alignItems = 'center';
        nodeButton.style.justifyContent = 'center';
        nodeButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)';
        nodeButton.title = "探索此區域";

        const nodeTypes = ['⚔️', '⚔️', '💎', '💧', '💰'];
        nodeButton.textContent = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        
        cell.appendChild(nodeButton);
        gridOverlay.appendChild(cell);
    }

    islandContainer.appendChild(gridOverlay);
    adventureTabContent.appendChild(islandContainer);

    console.log("已使用 JavaScript 強制渲染冒險島畫面，並將背景改為綠色。");
}

/**
 * 初始化冒險島UI的總入口函式。
 */
function initializeAdventureUI() {
    initializeAdventureDOMElements();
    renderAdventureIsland();
}
