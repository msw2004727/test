// js/ui-mailbox.js
// 負責處理信箱系統所有 UI 渲染與事件處理

/**
 * 初始化信箱系統的事件監聽器。
 */
function initializeMailboxSystem() {
    const mailButton = document.getElementById('snapshot-mail-btn');
    if (mailButton) {
        // 【修改】點擊按鈕時，呼叫 handleOpenMailbox 來打開信箱
        mailButton.addEventListener('click', handleOpenMailbox);
    }

    const mailboxContainer = document.getElementById('mailbox-list-container');
    if (mailboxContainer) {
        // 【新增】使用事件委派來處理信件列表中的所有點擊事件
        mailboxContainer.addEventListener('click', async (event) => {
            const mailItem = event.target.closest('.mail-item');
            if (!mailItem) return;

            const mailId = mailItem.dataset.mailId;
            if (!mailId) return;

            if (event.target.classList.contains('mail-delete-btn')) {
                // 如果點擊的是刪除按鈕
                event.stopPropagation(); // 防止觸發打開信件的事件
                await handleDeleteMail(mailId);
            } else {
                // 否則視為點擊郵件本身，準備打開
                await handleReadMail(mailId);
            }
        });
    }
}

/**
 * 處理打開主信箱彈窗的事件。
 * 會從後端獲取最新信件，然後渲染列表並顯示彈窗。
 */
async function handleOpenMailbox() {
    showFeedbackModal('讀取中...', '正在獲取您的信件...', true);
    try {
        // 【修改】呼叫真實的 API 來獲取信件
        const mails = await getMailbox(); 
        
        // 將獲取到的信件存入 gameState，以便其他地方使用
        if (gameState.playerData) {
            gameState.playerData.mailbox = mails;
        }

        renderMailboxList(mails);
        updateMailNotificationDot(mails); // 更新小紅點狀態
        hideModal('feedback-modal');
        showModal('mailbox-modal');
    } catch (error) {
        hideModal('feedback-modal');
        showFeedbackModal('錯誤', `無法讀取信箱：${error.message}`);
    }
}

/**
 * 【新增】處理刪除信件的邏輯
 * @param {string} mailId - 要刪除的信件 ID
 */
async function handleDeleteMail(mailId) {
    showConfirmationModal(
        '確認刪除',
        '您確定要永久刪除這封信件嗎？',
        async () => {
            showFeedbackModal('刪除中...', '正在處理您的請求...', true);
            try {
                await deleteMail(mailId);
                // 成功後，重新打開信箱以刷新列表
                await handleOpenMailbox(); 
            } catch (error) {
                 showFeedbackModal('錯誤', `刪除失敗：${error.message}`);
            } finally {
                hideModal('feedback-modal');
            }
        },
        { confirmButtonClass: 'danger', confirmButtonText: '確定刪除' }
    );
}

/**
 * 【新增】處理讀取信件的邏輯
 * @param {string} mailId - 要讀取的信件 ID
 */
async function handleReadMail(mailId) {
    const mail = gameState.playerData?.mailbox?.find(m => m.id === mailId);
    if (!mail) {
        showFeedbackModal('錯誤', '找不到該封信件的資料。');
        return;
    }
    
    // 如果信件未讀，則呼叫 API 將其標記為已讀
    if (!mail.is_read) {
        try {
            await markMailAsRead(mailId);
            mail.is_read = true; // 在本地端也更新狀態
            renderMailboxList(gameState.playerData.mailbox); // 重新渲染列表，讓狀態燈變色
            updateMailNotificationDot(gameState.playerData.mailbox); // 重新計算小紅點
        } catch (error) {
            console.error(`標記信件 ${mailId} 為已讀時出錯:`, error);
            // 即使出錯，依然繼續打開信件，不影響使用者操作
        }
    }
    
    // 根據信件類型，顯示不同的讀信彈窗內容 (此處為未來擴充的預留位置)
    const readerTitle = document.getElementById('mail-reader-title');
    const readerBody = document.getElementById('mail-reader-body');
    const readerFooter = document.getElementById('mail-reader-footer');

    if(readerTitle) readerTitle.textContent = mail.title;
    if(readerBody) readerBody.innerHTML = `<p>${mail.content || '此信件沒有內文。'}</p>`;
    if(readerFooter) readerFooter.innerHTML = ''; // 清空舊按鈕

    showModal('mail-reader-modal');
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
        const senderName = mail.sender_name ? `來自：${mail.sender_name}` : '系統訊息';
        
        return `
            <div class="mail-item ${statusClass}" data-mail-id="${mail.id}">
                <div class="mail-status-light ${statusClass}"></div>
                <div class="mail-info">
                    <div class="mail-title">${mail.title}</div>
                    <div class="mail-sender-time">${senderName} - ${new Date(mail.timestamp * 1000).toLocaleDateString()}</div>
                </div>
                <button class="mail-delete-btn" data-mail-id="${mail.id}" title="刪除信件">&times;</button>
            </div>
        `;
    }).join('');
}

/**
 * 檢查是否有未讀信件，並更新提示小紅點的顯示狀態。
 * @param {Array<object>} mails - 包含多個信件物件的陣列。
 */
function updateMailNotificationDot(mails) {
    const dot = document.getElementById('mail-notification-dot');
    if (!dot) return;

    // 如果 mails 是 undefined 或 null，也視為沒有未讀信件
    const hasUnread = mails ? mails.some(mail => !mail.is_read) : false;
    dot.style.display = hasUnread ? 'block' : 'none';
}

// --- 【移除】模擬資料的函式 ---
