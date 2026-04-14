# 休閒事業管理系 — 核心功能清單

> 從原站 (https://leisure.cyut.edu.tw/app/index.php) 萃取  
> 這些功能為網站改版的**必保留基礎**，不可刪減。

---

## 一、導覽系統 (Navigation)

| # | 功能 | 說明 |
|---|------|------|
| N-1 | 多層級主選單 | 12 個主項目 + 下拉子選單，hover/click 展開 |
| N-2 | 行動裝置漢堡選單 | 767px 以下自動切換，含 aria-expanded 狀態 |
| N-3 | 回首頁連結 | 固定於導覽列首位 |
| N-4 | 網站導覽頁 (Sitemap) | 提供全站頁面索引 |
| N-5 | 回到頂部按鈕 | 滾動超過門檻後顯示，平滑捲動 |

### 主選單結構

```
回首頁
系所簡介 → 系所介紹及發展 / 系所成員 / 教學資源
課程規劃 → 重補修處理方式 / 課程地圖 / 碩士班 / 碩士在職專班 / 大學部(日間) / 大學部(進修) / 大學部(國際產學專班)
實習專區 → 校外實習 / 校內實作
證照專區
下載專區 → 教師相關 / 導師相關 / 畢業專題 / 碩士生專區 / 大學部專區 / 其他文件下載
招生資訊
規章辦法
專班專區 → 國際產學專班
USR跨域創新應用微學程
精準樂活學程
系友專區 → 系友會組織章程 / 歷屆優秀系友 / 現任系友會幹部
```

---

## 二、內容展示模組 (Content Modules)

| # | 功能 | 說明 |
|---|------|------|
| C-1 | Banner 輪播 | 首頁頂部圖片/訊息輪播，支援自動播放、手動切換、圓點指示器 |
| C-2 | 快速連結區 (4 宮格) | 學生資訊系統 / 教職員資訊系統 / TronClass / 專業教室 |
| C-3 | 影音專區 | 嵌入影片展示（至少 2 則） |
| C-4 | 分頁公告系統 | 3 個 Tab：最新公告 / 工讀資訊 / 獎助學金資訊 |
| C-5 | 榮譽榜 | 成就列表（師生獲獎、競賽、證照），支援展開更多 |
| C-6 | 管理學院各系連結 | 6 個姊妹系所卡片連結 |

---

## 三、搜尋功能 (Search)

| # | 功能 | 說明 |
|---|------|------|
| S-1 | 站內關鍵字搜尋 | 搜尋表單 + token 驗證機制 |

---

## 四、多語系支援 (i18n)

| # | 功能 | 說明 |
|---|------|------|
| I-1 | 六語切換 | 繁體中文（預設）/ 简体中文 / English / Tiếng Việt / ภาษาไทย / Bahasa Indonesia |
| I-2 | URL 參數切換 | 透過 `?lang=` 參數保持語系狀態（向下相容原站 `?Lang=`） |
| I-3 | 語系記憶 | 使用者選擇的語系透過 localStorage 持久保存 |

---

## 五、外部整合 (Integrations)

| # | 功能 | 說明 |
|---|------|------|
| E-1 | 學生資訊系統 | 連結至 auth2.cyut.edu.tw |
| E-2 | 教職員資訊系統 | 連結至 cyutis.cyut.edu.tw |
| E-3 | TronClass 教學平台 | 線上教學系統入口 |
| E-4 | 社群媒體 (5 平台) | LINE / Facebook / Instagram / Threads / TikTok |
| E-5 | Email 聯繫 | leisure@cyut.edu.tw |

---

## 六、無障礙與可及性 (Accessibility)

| # | 功能 | 說明 |
|---|------|------|
| A-1 | ARIA 標籤 | tab 元件使用 aria-selected、aria-expanded |
| A-2 | 鍵盤導覽 | Tab / Shift+Tab / 方向鍵操作選單與分頁 |
| A-3 | 焦點管理 | 行動選單關閉時正確歸還焦點 |
| A-4 | 語義化 HTML | 使用 nav、header、footer、main、section |

---

## 七、文字禁止斷行 (No-Wrap)

| # | 功能 | 說明 |
|---|------|------|
| W-1 | UI 控制元素不換行 | 導覽選單、按鈕、Tab 標籤、日期、Badge 一律 `white-space: nowrap` |
| W-2 | 溢出處理 | 容器不足時使用 `text-overflow: ellipsis` 截斷，絕不自動換行 |
| W-3 | 行動導覽垂直堆疊 | 行動版使用漢堡選單垂直展開，不使用水平滑動（避免隱藏項目） |

> 唯一例外：段落正文 `<p>`、文章內容 `<article>` 內的正文允許自然換行。

---

## 八、響應式設計 (Responsive)

| # | 功能 | 說明 |
|---|------|------|
| R-1 | 桌面版 (≥1024px) | 流動式佈局，max-width 容器，多欄網格 |
| R-2 | 平板版 (768-1023px) | 兩欄佈局，部分元件收合 |
| R-3 | 手機版 (<768px) | 單欄佈局、漢堡選單、觸控友善按鈕（最小 48x48px） |

---

## 九、動態載入 (Dynamic Loading)

| # | 功能 | 說明 |
|---|------|------|
| D-1 | AJAX 內容載入 | 分頁公告透過 AJAX 按需載入，不整頁刷新 |
| D-2 | 模組化載入 | Banner、公告各模組獨立載入 |

---

## 十、主題系統 (Theme)

| # | 功能 | 說明 |
|---|------|------|
| T-1 | 深淺主題切換 | Light / Dark 雙主題，透過 CSS Custom Properties 切換全站色彩 |
| T-2 | 系統偏好偵測 | 首次載入偵測 `prefers-color-scheme`，自動套用系統主題 |
| T-3 | 主題記憶 | 使用者手動切換後透過 localStorage 持久保存 |
| T-4 | 即時切換 | 切換時不重新載入頁面，所有元件即時反映色彩變化 |

---

## 十一、彈跳視窗提醒 (Modal Notification)

| # | 功能 | 說明 |
|---|------|------|
| M-1 | 公告彈窗 | 首次進站或有重要公告時自動彈出提醒視窗 |
| M-2 | 手動關閉 | 點擊關閉按鈕或遮罩層關閉，支援 ESC 鍵關閉 |
| M-3 | 不再顯示 | 以公告內容 hash 為 key 存入 localStorage，內容不變時不重複彈出 |
| M-4 | 焦點鎖定 | 彈窗開啟時焦點鎖定在視窗內，關閉後歸還焦點（WCAG） |
| M-5 | 多則輪播 | 支援多則公告在同一彈窗中切換 |
| M-6 | 背景鎖定 | 彈窗開啟時 `document.documentElement` 設 `overflow: hidden`，關閉後恢復 |

---

## 十二、浮球按鈕 (Floating Action Button)

| # | 功能 | 說明 |
|---|------|------|
| B-1 | 固定浮球 | 固定於視窗右下角，不隨頁面捲動消失 |
| B-2 | 展開選單 | 點擊浮球展開社群/聯繫快捷連結（LINE、FB、電話、Email），回到頂部獨立保留於 N-5 |
| B-3 | 收合動畫 | 展開/收合使用 CSS transform + scale 動畫 |
| B-4 | 自動收合 | 點擊任一子項目或頁面其他區域後自動收合 |
| B-5 | 行動裝置適配 | 浮球在手機上尺寸加大，觸控友善（最小 48x48px） |

---

## 十三、季節特效 (Seasonal Effects)

| # | 功能 | 說明 |
|---|------|------|
| SE-1 | Canvas 粒子畫布 | `position: fixed` 全屏 Canvas，`pointer-events: none`，不影響操作 |
| SE-2 | 自動季節偵測 | 依系統日期判定春(3-5)/夏(6-8)/秋(9-11)/冬(12-2) |
| SE-3 | 春季花瓣 | 粉色花瓣由上方飄落，帶旋轉與水平飄移 |
| SE-4 | 夏季飛鳥光斑 | 鳥群剪影橫向飛越 + 陽光光斑閃爍 |
| SE-5 | 秋季落葉 | 紅橙黃落葉飄落，帶搖擺與旋轉 |
| SE-6 | 冬季雪花 | 白色雪花緩慢飄落，大小不一 |
| SE-7 | 使用者開關 | 可手動啟用/停用，偏好存入 localStorage |
| SE-8 | 效能保護 | 行動裝置預設關閉、30fps 上限、最大 30 粒子、背景頁籤暫停 |
| SE-9 | 減少動畫偵測 | `prefers-reduced-motion: reduce` 時完全停用 |
| SE-10 | 外掛式擴充 | 新增季節只需新增配置檔案，不修改核心引擎 |

---

## 十四、小工具系統 (Widget System)

| # | 功能 | 說明 |
|---|------|------|
| WG-1 | 註冊式架構 | Widget Registry 外掛系統，新增 widget 只需寫模組 + 註冊 |
| WG-2 | 日曆 Widget | 月曆網格 + 農曆日期（查表法）+ 節氣 + 國定假日標記 |
| WG-3 | 時鐘 Widget | 即時時間 HH:MM:SS + 日期 + 星期，依語系自動格式化 |
| WG-4 | 天氣預報 Widget | 台中霧峰天氣 + 溫度 + 降雨機率，localStorage 快取 30min |
| WG-5 | 國定假日倒數 | 距下一個國定假日天數倒數 + 假日名稱（六語） |
| WG-6 | 面板 UI | 可展開/收合側邊欄面板，桌面常態/行動底部上滑 |
| WG-7 | 啟停控制 | 使用者可啟用/停用個別 Widget，偏好存入 localStorage |
| WG-8 | 主題/語系回呼 | 切換深淺主題或語系時自動通知所有 Widget 更新 |

---

## 十五、版號系統 (Versioning)

| # | 功能 | 說明 |
|---|------|------|
| V-1 | 語義化版號 | MAJOR.MINOR.PATCH 格式，集中定義於 `version.json` |
| V-2 | Build Script | 一鍵遞增版號 + 注入 HTML + CSS/JS 快取破壞 + WebP 轉換 + SVG 壓縮 |
| V-3 | 快取破壞 | 所有 CSS/JS/圖片 URL 帶 `?v=版號`，版號變更 = 自動換新 |
| V-4 | 版號可見 | 頁尾顯示版號、HTML meta 標籤、JS 全域變數、Console 啟動訊息 |

---

## 十六、加載速度架構 (Performance Architecture)

| # | 功能 | 說明 |
|---|------|------|
| P-1 | Critical CSS 內聯 | 首屏渲染所需樣式內聯在 `<head>`，完整 CSS 非同步載入 |
| P-2 | modulepreload | 首屏 JS 模組用 `<link rel="modulepreload">`，消除 import waterfall |
| P-3 | 骨架屏佔位 | 首屏外區塊含 skeleton loading 佔位，JS 載入後替換 |
| P-4 | content-visibility | 首屏外 section 設 `content-visibility: auto`，延遲渲染加速 FCP |
| P-5 | 區塊邊界標準化 | 每個 section 有唯一 id + data-section + aria-labelledby + contain-intrinsic-size |
| P-6 | 快取策略 | CSS/JS 帶版號 immutable 快取 + HTML no-cache ETag 驗證 |
| P-7 | Service Worker | 可選漸進增強，版號寫入 CACHE_NAME，版號更新 = 舊快取自動清除 |
| P-8 | 資源預連線 | preconnect Google Fonts + dns-prefetch 外部系統 |

---

## 十七、SEO 與 AI 搜尋 (SEO & AI Search)

| # | 功能 | 說明 |
|---|------|------|
| SEO-1 | 完整 Meta 標籤 | title / description / keywords / canonical / robots |
| SEO-2 | Open Graph | og:title / og:description / og:image / og:url，社群分享最佳化 |
| SEO-3 | JSON-LD 結構化資料 | WebSite + EducationalOrganization + BreadcrumbList schema |
| SEO-4 | 多語系 hreflang | 六語對應 `<link rel="alternate" hreflang="">` |
| SEO-5 | sitemap.xml | 全站頁面清單含 lastmod / changefreq / priority |
| SEO-6 | robots.txt | 允許爬蟲 + 指向 sitemap |
| SEO-7 | 語義化 HTML | 嚴格使用語義標籤 + 標題不跳級 + `<time datetime>` 包裹日期 |
| SEO-8 | AI 搜尋就緒 | 核心文字在 HTML 原始碼中可見（不依賴 JS 渲染），結構清晰供 AI 提取 |

---

## 十八、管理後台對接 (Admin & CMS Integration)

| # | 功能 | 說明 |
|---|------|------|
| CMS-1 | 管理者登入頁 | 獨立 `/admin/` 頁面，帳號密碼驗證，對接現有後台認證系統 |
| CMS-2 | 登入狀態管理 | JWT 或 Session Token 驗證，存入 sessionStorage（非 localStorage），逾時自動登出 |
| CMS-3 | 公告管理 | CRUD 公告（新增/編輯/刪除/排序），支援富文字編輯器、分類（最新公告/工讀/獎助學金）|
| CMS-4 | 榮譽榜管理 | CRUD 榮譽項目（標題/日期/連結），支援排序與上下架 |
| CMS-5 | Banner 輪播管理 | 上傳/替換/排序輪播圖片，設定標題文字與連結 |
| CMS-6 | 檔案下載管理 | 上傳檔案（PDF/DOC/XLS），分類至 6 個下載子區（教師/導師/畢業專題/碩士/大學部/其他）|
| CMS-7 | 圖片庫管理 | 上傳圖片至圖庫，支援 WebP 自動轉換，可選用於任何內容區塊 |
| CMS-8 | 系所成員管理 | 編輯教職員個人資料（姓名/職稱/專長/Email/照片/辦公室/分機）|
| CMS-9 | 前台即時預覽 | 後台編輯後可即時預覽前台顯示效果，無需重新部署 |
| CMS-10 | API 抽象層 | 前端透過統一 DataService 模組呼叫 API，後端可替換而不影響前端 |
| CMS-11 | 資料快取 | 前端快取 API 回應至 localStorage/sessionStorage，設定 TTL，減少請求 |
| CMS-12 | 靜態 fallback | API 不可用時，前端顯示 HTML 中的靜態預設內容，確保網站不空白 |

---

## 十九、頁尾資訊 (Footer)

| # | 功能 | 說明 |
|---|------|------|
| F-1 | 聯絡資訊 | 地址 / 電話分機 / 傳真 / Email |
| F-2 | 快速連結 | 常用頁面捷徑 |
| F-3 | 相關連結 | 朝陽科技大學首頁、管理學院等 |
| F-4 | 版權聲明 | 系所全名 + 版權文字 |

---

## 功能統計

- **導覽功能**: 5 項
- **內容模組**: 6 項
- **搜尋功能**: 1 項
- **多語系**: 3 項
- **外部整合**: 5 項
- **無障礙**: 4 項
- **禁止斷行**: 3 項
- **響應式**: 3 項
- **動態載入**: 2 項
- **主題系統**: 4 項
- **彈跳視窗**: 6 項
- **浮球按鈕**: 5 項
- **季節特效**: 10 項
- **小工具系統**: 8 項
- **版號系統**: 4 項
- **加載速度架構**: 8 項
- **SEO/AI搜尋**: 8 項
- **管理後台對接**: 12 項
- **頁尾**: 4 項
- **合計**: 101 項核心功能
