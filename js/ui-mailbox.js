// js/ui-mailbox.js
// 負責處理信箱系統所有 UI 渲染與事件處理

/**
 * 初始化信箱系統的事件監聽器。
 */
function initializeMailboxSystem() {
    const mailButton = document.getElementById('snapshot-mail-btn');
    if (mailButton) {
        mailButton.addEventListener('click', handleOpenMailbox);
    }
}

/**
 * 處理打開主信箱彈窗的事件。
 * 會先從後端獲取最新信件，然後再顯示。
 */
async function handleOpenMailbox() {
    showFeedbackModal('讀取中...', '正在獲取您的信件...', true);
    try {
        // 這裡未來會替換成真實的 API 呼叫
        // const mails = await getMails(); 
        const mails = getMockMails(); // 暫時使用模擬資料

        renderMailboxList(mails);
        hideModal('feedback-modal');
        showModal('mailbox-modal');
    } catch (error) {
        hideModal('feedback-modal');
        showFeedbackModal('錯誤', `無法讀取信箱：${error.message}`);
    }
}

/**
 * 根據信件列表，渲染主信箱的介面。
 * @param {Array<object>} mails - 包含多個信件物件的陣列。
 */
function renderMailboxList(mails) {
    const container = document.getElementById('mailbox-list-container');
    if (!container) return;

    if (!mails || mails.length === 0) {
        container.innerHTML = `<p class="text-center text-sm text-[var(--text-secondary)] py-4">您的信箱是空的。</p>`;
        return;
    }

    container.innerHTML = mails.map(mail => {
        const statusClass = mail.is_read ? 'read' : 'unread';
        return `
            <div class="mail-item ${statusClass}" data-mail-id="${mail.id}">
                <div class="mail-status-light ${statusClass}"></div>
                <div class="mail-title">${mail.title}</div>
                <button class="mail-delete-btn" data-mail-id="${mail.id}">&times;</button>
            </div>
        `;
    }).join('');

    // 為每個項目加上事件監聽器 (未來實作)
    container.querySelectorAll('.mail-item').forEach(item => {
        item.addEventListener('click', (event) => {
            if (event.target.classList.contains('mail-delete-btn')) {
                // 點擊刪除按鈕的邏輯
                console.log(`準備刪除郵件: ${item.dataset.mailId}`);
            } else {
                // 點擊郵件標題的邏輯
                console.log(`準備開啟郵件: ${item.dataset.mailId}`);
            }
        });
    });
}

/**
 * 檢查是否有未讀信件，並更新提示小紅點的顯示狀態。
 * @param {Array<object>} mails - 包含多個信件物件的陣列。
 */
function updateMailNotificationDot(mails) {
    const dot = document.getElementById('mail-notification-dot');
    if (!dot) return;

    const hasUnread = mails.some(mail => !mail.is_read);
    dot.style.display = hasUnread ? 'block' : 'none';
}


// --- 模擬資料，供前期測試使用 ---
function getMockMails() {
    return [
        {
            id: 'mail-001',
            type: 'friend_request',
            title: '來自「新手訓練師」的好友邀請',
            sender_id: 'player-abc',
            sender_name: '新手訓練師',
            timestamp: Math.floor(Date.now() / 1000) - 3600,
            is_read: false,
            payload: {}
        },
        {
            id: 'mail-002',
            type: 'system_message',
            title: '系統維護公告',
            content: '親愛的玩家，我們將於下週二進行系統維護，屆時將無法登入遊戲。',
            timestamp: Math.floor(Date.now() / 1000) - 86400,
            is_read: false,
        },
        {
            id: 'mail-003',
            type: 'reward',
            title: '首次登入獎勵',
            content: '感謝您的加入！這是我們為您準備的小禮物。',
            timestamp: Math.floor(Date.now() / 1000) - 172800,
            is_read: true,
            payload: { item_type: 'gold', amount: 500 }
        }
    ];
}
