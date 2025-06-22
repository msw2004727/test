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

    // 步驟 1: 建立一個外層 Wrapper 來做置中
    const wrapper = document.createElement('div');
    wrapper.className = 'adventure-wrapper';

    // 步驟 2: 建立一個內層 Content Area 來維持長寬比，並放置背景和網格
    const contentArea = document.createElement('div');
    contentArea.className = 'adventure-content-area';

    // 步驟 3: 產生 25 個格子並直接放入 Content Area 中
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'adventure-grid-cell';

        // 在每個格子中都先放入一個預設的按鈕
        const nodeButton = document.createElement('button');
        nodeButton.className = 'adventure-node-btn';
        nodeButton.dataset.nodeIndex = i; // 標記按鈕的索引
        
        // 隨機指派圖示
        const nodeTypes = ['combat', 'combat', 'combat', 'treasure', 'fountain'];
        const randomType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        nodeButton.classList.add(`type-${randomType}`);
        nodeButton.title = "探索此區域";

        cell.appendChild(nodeButton);
        contentArea.appendChild(cell);
    }

    // 組合結構並放入頁籤
    wrapper.appendChild(contentArea);
    adventureTabContent.appendChild(wrapper);
}
