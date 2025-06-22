// js/ui-adventure.js
// 專門負責渲染「冒險島」的所有UI。

/**
 * 初始化冒險島UI的總入口函式。
 * 當玩家點擊「冒險島」頁籤時，這個函式會被觸發。
 */
function initializeAdventureUI() {
    const adventureTabContent = document.getElementById('guild-content');
    if (!adventureTabContent) {
        console.error("冒險島的內容容器 'guild-content' 未找到。");
        return;
    }
    
    // 清空現有內容
    adventureTabContent.innerHTML = '';

    // 建立一個同時作為背景和網格的單一容器
    const gridContainer = document.createElement('div');
    gridContainer.className = 'adventure-grid-container';

    // 產生 5x5 = 25 個格子
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'adventure-grid-cell';

        // 在每個格子中都放入一個按鈕
        const nodeButton = document.createElement('button');
        nodeButton.className = 'adventure-node-btn';
        nodeButton.dataset.nodeIndex = i; // 標記按鈕的索引
        
        // 隨機指派圖示
        const nodeTypes = ['combat', 'combat', 'combat', 'treasure', 'fountain'];
        const randomType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        nodeButton.classList.add(`type-${randomType}`);
        nodeButton.title = "探索此區域";

        cell.appendChild(nodeButton);
        gridContainer.appendChild(cell);
    }

    // 將完整的容器放進頁籤內容區
    adventureTabContent.appendChild(gridContainer);
}
