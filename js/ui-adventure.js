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
    
    adventureTabContent.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'adventure-wrapper';

    const contentArea = document.createElement('div');
    contentArea.className = 'adventure-content-area';

    // 產生 25 個格子，並為每個格子加上獨立ID
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        // 【核心修改】賦予 cell 兩個 class 和一個獨立的 id
        cell.className = 'adventure-grid-cell';
        cell.id = `grid-cell-${i}`; // 例如 grid-cell-0, grid-cell-1...

        const nodeButton = document.createElement('button');
        nodeButton.className = 'adventure-node-btn';
        nodeButton.dataset.nodeIndex = i;
        
        const nodeTypes = ['combat', 'combat', 'combat', 'treasure', 'fountain'];
        const randomType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        nodeButton.classList.add(`type-${randomType}`);
        nodeButton.title = "探索此區域";

        cell.appendChild(nodeButton);
        contentArea.appendChild(cell);
    }

    wrapper.appendChild(contentArea);
    adventureTabContent.appendChild(wrapper);
}
