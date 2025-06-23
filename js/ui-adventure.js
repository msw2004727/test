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

    // 【修改】暫時使用硬編碼的設施資料，模擬從後端獲取
    const facilityData = [
        {
            id: "facility_001",
            name: "新手森林",
            description: "充滿了相對溫和的怪獸，是新手訓練師磨練技巧的最佳場所。",
            cost: 10
        },
        {
            id: "facility_002",
            name: "廢棄礦坑",
            description: "黑暗的礦坑深處似乎潛藏著什麼，傳聞有稀有的金屬系怪獸出沒。",
            cost: 25
        },
        {
            id: "facility_003",
            name: "潮汐洞穴",
            description: "隨著潮水漲落而變化的洞穴，需要把握時機才能深入探索。",
            cost: 40
        }
    ];

    // 建立一個外層 Wrapper 來做置中
    const wrapper = document.createElement('div');
    wrapper.className = 'adventure-wrapper';

    // 建立一個內層 Content Area 來維持長寬比，並放置背景和內容
    const contentArea = document.createElement('div');
    contentArea.className = 'adventure-content-area';

    // 【新增】建立島嶼容器
    const islandContainer = document.createElement('div');
    islandContainer.className = 'adventure-island-container';

    // 【新增】島嶼標題
    const islandTitle = document.createElement('h3');
    islandTitle.className = 'adventure-island-title';
    islandTitle.textContent = '初始之島';
    islandContainer.appendChild(islandTitle);

    // 【新增】設施列表容器
    const facilityList = document.createElement('div');
    facilityList.className = 'adventure-facility-list';

    // 【修改】根據設施資料動態生成卡片
    facilityData.forEach(facility => {
        const card = document.createElement('div');
        card.className = 'adventure-facility-card';

        card.innerHTML = `
            <div class="facility-card-header">
                <h4 class="facility-title">${facility.name}</h4>
                <span class="facility-cost">費用: ${facility.cost} 🪙</span>
            </div>
            <div class="facility-card-body">
                <p>${facility.description}</p>
            </div>
            <div class="facility-card-footer">
                <button class="button primary challenge-facility-btn" data-facility-id="${facility.id}">挑戰</button>
            </div>
        `;
        facilityList.appendChild(card);
    });

    // 組合結構並放入頁籤
    islandContainer.appendChild(facilityList);
    contentArea.appendChild(islandContainer);
    wrapper.appendChild(contentArea);
    adventureTabContent.appendChild(wrapper);
}
