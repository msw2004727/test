// js/ui-farm.js
// 這個檔案專門處理「怪獸農場」頁籤的UI渲染與相關更新。

/**
 * 【新增】處理點擊怪獸卡片上的「治療」按鈕。
 * @param {string} monsterId - 要治療的怪獸 ID。
 */
async function handleHealClick(monsterId) {
    if (!monsterId) return;

    // 顯示一個包含治療選項的彈窗，或直接執行預設治療
    showConfirmationModal(
        '治療怪獸',
        '您想要如何治療這隻怪獸？',
        async () => {
            showFeedbackModal('治療中...', '正在施展治癒魔法...', true);
            try {
                const result = await healMonster(monsterId, 'full_restore');
                if (result) {
                    await refreshPlayerData();
                    showFeedbackModal('成功', '怪獸已完全恢復！');
                } else {
                    throw new Error('治療失敗或從伺服器返回無效的回應。');
                }
            } catch (error) {
                hideModal('feedback-modal');
                showFeedbackModal('錯誤', `治療失敗: ${error.message}`);
            }
        },
        { confirmButtonClass: 'success', confirmButtonText: '完全治癒' }
    );
}


function updateAllTimers() {
    const timerElements = document.querySelectorAll('.training-timer');
    timerElements.forEach(timerEl => {
        const startTime = parseInt(timerEl.dataset.startTime, 10);
        const duration = parseInt(timerEl.dataset.duration, 10);
        if (!startTime || !duration) return;

        const now = Date.now();
        const elapsedTime = Math.floor((now - startTime) / 1000);
        const totalDuration = Math.floor(duration / 1000);
        const displayTime = Math.min(elapsedTime, totalDuration);

        // 找到對應的狀態文字元素 (即計時器前面的那個元素)
        const statusTextEl = timerEl.previousElementSibling;

        if (displayTime >= totalDuration) {
            // 修煉時間已滿
            if (statusTextEl) {
                statusTextEl.textContent = '已完成';
                statusTextEl.style.color = 'var(--success-color)';
                statusTextEl.style.fontWeight = 'bold';
            }
            // 隱藏計時器文字
            timerEl.style.display = 'none';
        } else {
            // 修煉仍在進行，更新計時器
            timerEl.textContent = `(${displayTime} / ${totalDuration}s)`;
        }
    });
}

function showMonsterInfoFromFarm(monsterId) {
    if (!monsterId) return;
    const monster = gameState.playerData.farmedMonsters.find(m => m.id === monsterId);
    if (monster) {
        // This function is defined in ui-monster-modals.js
        if (typeof updateMonsterInfoModal === 'function') {
            updateMonsterInfoModal(monster, gameState.gameConfigs, gameState.playerData);
            showModal('monster-info-modal');
        } else {
            console.error("updateMonsterInfoModal function is not defined.");
        }
    } else {
        console.error(`Monster with ID ${monsterId} not found in farm.`);
        showFeedbackModal('錯誤', '找不到該怪獸的資料。');
    }
}


function renderMonsterFarm() {
    const listContainer = DOMElements.farmedMonstersList;

    if (!listContainer) {
        console.error("renderMonsterFarm Error: Farm container (#farmed-monsters-list) not found.");
        return;
    }

    listContainer.innerHTML = '';
    
    listContainer.className = 'farm-card-grid';


    const monsters = gameState.playerData?.farmedMonsters || [];

    if (monsters.length === 0) {
        listContainer.innerHTML = `<p class="text-center text-sm text-[var(--text-secondary)] py-4 col-span-full">您的農場空空如也，快去組合新的怪獸吧！</p>`;
        listContainer.className = ''; 
        return;
    }
    
    monsters.forEach((monster) => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';
        
        const isDeployed = gameState.playerData.selectedMonsterId === monster.id;
        if (isDeployed) {
            monsterCard.classList.add('deployed');
        }

        const displayName = getMonsterDisplayName(monster, gameState.gameConfigs);
        const rarityMap = {'普通':'common', '稀有':'rare', '菁英':'elite', '傳奇':'legendary', '神話':'mythical'};
        const rarityKey = monster.rarity ? (rarityMap[monster.rarity] || 'common') : 'common';

        let headInfo = { type: '無', rarity: '普通' }; 
        const constituentIds = monster.constituent_dna_ids || [];
        
        if (constituentIds.length > 0) {
            const headDnaId = constituentIds[0];
            const allDnaTemplates = gameState.gameConfigs?.dna_fragments || [];
            const headDnaTemplate = allDnaTemplates.find(dna => dna.id === headDnaId);

            if (headDnaTemplate) {
                headInfo.type = headDnaTemplate.type || '無';
                headInfo.rarity = headDnaTemplate.rarity || '普通';
            }
        }

        const imagePath = getMonsterPartImagePath('head', headInfo.type, headInfo.rarity);
        let avatarHtml = `<div class="monster-card-avatar" style="${imagePath ? `background-image: url('${imagePath}')` : ''}"></div>`;

        let deployButtonHtml = `<button class="monster-card-deploy-btn ${isDeployed ? 'deployed' : ''}" onclick="handleDeployMonsterClick('${monster.id}')" ${isDeployed ? 'disabled' : ''}>${isDeployed ? '⚔️' : '出戰'}</button>`;
        
        let statusHtml = '';
        if (monster.farmStatus?.isTraining) {
            const startTime = monster.farmStatus.trainingStartTime || Date.now();
            const duration = monster.farmStatus.trainingDuration || 3600000;
            statusHtml = `
                <div class="monster-card-status">
                    <div style="color: var(--accent-color);">修煉中</div>
                    <div class="training-timer text-xs" data-start-time="${startTime}" data-duration="${duration}"></div>
                </div>
            `;
        } else if (monster.hp < monster.initial_max_hp * 0.25) {
            statusHtml = `<div class="monster-card-status" style="color: var(--danger-color);">瀕死</div>`;
        } else {
            statusHtml = `<div class="monster-card-status">閒置中</div>`;
        }
        
        // --- 【核心修改處】---
        // 調整按鈕順序
        let actionsHTML = '';
        if (isDeployed) {
            actionsHTML = `
                <button class="button danger text-xs" disabled>放生</button>
                <button class="button text-xs" onclick="handleHealClick('${monster.id}')">治療</button>
                <button class="button primary text-xs" disabled>修煉</button>
            `;
        } else if (monster.farmStatus?.isTraining) {
            const startTime = monster.farmStatus.trainingStartTime || Date.now();
            const duration = monster.farmStatus.trainingDuration || 3600000;
            actionsHTML = `
                <button class="button danger text-xs" disabled>放生</button>
                <button class="button text-xs" onclick="handleHealClick('${monster.id}')">治療</button>
                <button class="button warning text-xs" onclick="handleEndCultivationClick(event, '${monster.id}', ${startTime}, ${duration})">召回</button>
            `;
        } else {
            actionsHTML = `
                <button class="button danger text-xs" onclick="handleReleaseMonsterClick(event, '${monster.id}')">放生</button>
                <button class="button text-xs" onclick="handleHealClick('${monster.id}')">治療</button>
                <button class="button primary text-xs" onclick="handleCultivateMonsterClick(event, '${monster.id}')">修煉</button>
            `;
        }

        monsterCard.innerHTML = `
            <div class="monster-card-name text-rarity-${rarityKey} text-xs">${displayName}</div>
            <a href="#" onclick="showMonsterInfoFromFarm('${monster.id}'); return false;" style="text-decoration: none;">
                ${avatarHtml}
            </a>
            ${deployButtonHtml}
            <div class="monster-card-actions">
                ${actionsHTML}
            </div>
            ${statusHtml} 
        `;
        
        listContainer.appendChild(monsterCard);
    });
}
