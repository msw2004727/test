// js/ui-mailbox.js
// 處理信箱系統的 UI 渲染與互動邏輯

// --- DOM 元素定義 ---
let mailboxDOMElements = {};

function initializeMailboxDOMElements() {
    mailboxDOMElements = {
        mailboxModal: document.getElementById('mailbox-modal'),
        mailListContainer: document.getElementById('mailbox-list-container'),
        refreshMailboxBtn: document.getElementById('refresh-mailbox-btn'),
        deleteReadMailsBtn: document.getElementById('delete-read-mails-btn'),
        
        mailReaderModal: document.getElementById('mail-reader-modal'),
        mailReaderTitle: document.getElementById('mail-reader-title'),
        mailReaderSender: document.getElementById('mail-reader-sender'),
        mailReaderTimestamp: document.getElementById('mail-reader-timestamp'),
        mailReaderBody: document.getElementById('mail-reader-body').querySelector('.mail-content-text'),
        mailReaderAttachmentsContainer: document.getElementById('mail-reader-attachments'),
    };
}

/**
 * 渲染信箱列表
 * @param {Array<object>} mails - 從後端獲取的信件物件陣列
 */
function renderMailboxList(mails) {
    const container = mailboxDOMElements.mailListContainer;
    if (!container) return;

    if (!mails || mails.length === 0) {
        container.innerHTML = `<p class="text-center text-sm text-[var(--text-secondary)] py-10">信箱空空如也...</p>`;
        return;
    }

    // 根據時間戳由新到舊排序
    mails.sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = mails.map(mail => {
        const mailDate = new Date(mail.timestamp * 1000).toLocaleString();
        const statusClass = mail.is_read ? 'read' : 'unread';
        const senderName = mail.sender_name || '系統訊息';

        return `
            <div class="mail-item ${statusClass}" data-mail-id="${mail.id}">
                <div class="mail-status-light ${statusClass}" title="${statusClass === 'unread' ? '未讀' : '已讀'}"></div>
                <div class="mail-title-container">
                    <p class="mail-title">${mail.title}</p>
                    <p class="text-xs text-[var(--text-secondary)]">寄件人: ${senderName} | ${mailDate}</p>
                </div>
                <button class="mail-delete-btn" title="刪除信件" data-mail-id="${mail.id}">&times;</button>
            </div>
        `;
    }).join('');
}


/**
 * 開啟單一信件的閱讀器
 * @param {string} mailId - 要開啟的信件 ID
 */
async function openMailReader(mailId) {
    const mail = gameState.playerData?.mailbox?.find(m => m.id === mailId);
    if (!mail) {
        showFeedbackModal('錯誤', '找不到該封信件。');
        return;
    }

    // 填充讀信彈窗的內容
    mailboxDOMElements.mailReaderTitle.textContent = mail.title;
    mailboxDOMElements.mailReaderSender.textContent = mail.sender_name || '系統';
    mailboxDOMElements.mailReaderTimestamp.textContent = new Date(mail.timestamp * 1000).toLocaleString();
    mailboxDOMElements.mailReaderBody.innerHTML = mail.content.replace(/\n/g, '<br>');

    // TODO: 未來在此處處理附件的顯示與領取邏輯
    mailboxDOMElements.mailReaderAttachmentsContainer.style.display = 'none';

    showModal('mail-reader-modal');

    // 如果信件是未讀的，則呼叫 API 將其標記為已讀
    if (!mail.is_read) {
        try {
            await fetchAPI(`/mailbox/${mailId}/read`, { method: 'POST' });
            // 成功後刷新玩家資料，這會自動更新 UI
            await refreshPlayerData(); 
            // 重新渲染信箱列表以立即移除未讀狀態
            renderMailboxList(gameState.playerData.mailbox);
            updateMailNotificationDot(); // 更新小紅點
        } catch (error) {
            console.error(`標記信件 ${mailId} 為已讀時失敗:`, error);
        }
    }
}

/**
 * 處理刪除信件的請求
 * @param {string} mailId - 要刪除的信件 ID
 * @param {Event} event - 點擊事件
 */
async function handleDeleteMail(mailId, event) {
    event.stopPropagation(); // 防止觸發外層的 openMailReader

    showConfirmationModal(
        '確認刪除',
        '您確定要永久刪除這封信件嗎？',
        async () => {
            showFeedbackModal('刪除中...', '正在處理您的請求...', true);
            try {
                await fetchAPI(`/mailbox/${mailId}`, { method: 'DELETE' });
                await refreshPlayerData();
                renderMailboxList(gameState.playerData.mailbox);
                updateMailNotificationDot();
                hideModal('feedback-modal');
                showFeedbackModal('成功', '信件已刪除。');
            } catch (error) {
                hideModal('feedback-modal');
                showFeedbackModal('刪除失敗', `無法刪除信件：${error.message}`);
            }
        },
        { confirmButtonClass: 'danger', confirmButtonText: '確定刪除' }
    );
}

/**
 * 初始化信箱系統的所有事件監聽器
 */
function initializeMailboxEventHandlers() {
    initializeMailboxDOMElements();

    const mailButton = document.getElementById('snapshot-mail-btn');
    if (mailButton) {
        mailButton.onclick = async () => {
            // 每次打開信箱時，都先從後端獲取最新的信件列表
            showFeedbackModal('載入中...', '正在收取信件...', true);
            try {
                await refreshPlayerData(); // 刷新確保資料最新
                renderMailboxList(gameState.playerData?.mailbox || []);
                updateMailNotificationDot();
                hideModal('feedback-modal');
                showModal('mailbox-modal');
            } catch (error) {
                hideModal('feedback-modal');
                showFeedbackModal('錯誤', `無法開啟信箱：${error.message}`);
            }
        };
    }
    
    // 為信箱列表容器設定事件委派
    if (mailboxDOMElements.mailListContainer) {
        mailboxDOMElements.mailListContainer.addEventListener('click', (event) => {
            const mailItem = event.target.closest('.mail-item');
            const deleteBtn = event.target.closest('.mail-delete-btn');

            if (deleteBtn) {
                // 如果點擊的是刪除按鈕
                const mailId = deleteBtn.dataset.mailId;
                handleDeleteMail(mailId, event);
            } else if (mailItem) {
                // 如果點擊的是信件本身
                const mailId = mailItem.dataset.mailId;
                openMailReader(mailId);
            }
        });
    }
}
