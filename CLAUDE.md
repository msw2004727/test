# CLAUDE.md — 朝陽科技大學 休閒事業管理系 網站改版專案

## 專案概述

將朝陽科技大學休閒事業管理系官網從傳統 CMS 風格全面翻修為現代化網站。  
原站 URL：`https://leisure.cyut.edu.tw/app/index.php`  
保留所有 101 項核心功能（詳見 `docs/features.md`），大幅升級視覺設計與技術架構。

**系所聯絡資訊（正式值）：**

| 項目 | 值 |
|------|-----|
| 地址 | 413310 台中市霧峰區吉峰東路168號 T2-619.1室 |
| 電話 | (04) 23323000 分機 7452、7454、7458、7463、7465、7451 |
| 傳真 | (04) 23742363 |
| Email | leisure@cyut.edu.tw |

---

## !! 新開發者必讀 — 快速上手 + 致命陷阱 !!

> **本段是整份計畫書的導航入口。新對話、新開發者請從此處開始。**

### 第一步：環境啟動

```bash
git clone <repo-url> && cd 朝陽
npm install                      # 安裝 svgo 等 devDependencies
npx serve . -l 3000              # 或 VS Code Live Server
# 瀏覽器開啟 http://localhost:3000
```

### 第二步：理解專案現狀

| 狀態 | 內容 |
|------|------|
| **已存在（原型/規劃階段）** | `index.html`（舊版原型，使用 Font Awesome，待全面重寫）、`css/style.css`（舊版單檔 CSS，待拆分為 4 檔）、`js/main.js`（舊版單檔 JS，待拆分為 ES Modules） |
| **已存在（可直接使用）** | 33 個 SVG 圖示 `assets/icons/svg/`、11 張原站圖片 `assets/images/original/`、6 語 i18n JSON `i18n/*.json`（154 keys 全同步）、Build 腳本 `scripts/`、`version.json`、`package.json`、`robots.txt`、`sitemap.xml` |
| **待建構** | 4 檔 CSS 拆分（base/layout/components/utilities）、ES Module 拆分（navigation/banner/tabs/...）、`data-service.js` API 抽象層、`admin/` 管理後台、seasonal 粒子引擎、widget 系統、modal、FAB、所有子頁面 `pages/*.html`、Service Worker `sw.js` |

### 第三步：開發 vs 生產

| 環境 | CSS 引用 | JS 引用 | 版號 |
|------|----------|---------|------|
| **開發** | 4 支分檔 `<link>` 直接載入 | `<script type="module" src="js/main.js">` | 無需注入 |
| **生產** | `npm run build:patch` → `dist/css/style.css?v=版號` | `dist/js/main.js?v=版號` | build.sh 自動注入 |

### 致命陷阱速查表

> **以下是三輪 17 位次 AI 專家審計出的高風險項目。違反任一條都會造成實際 bug。**

| # | 陷阱 | 後果 | 正確做法 |
|---|------|------|----------|
| **P1** | oklch() 色彩沒有 hsl() fallback | ~7-8% 東南亞用戶看到**完全無樣式**的白頁 | 先寫 hsl() 值 → `@supports (color: oklch(...))` 中覆蓋 oklch()。**詳見本文件「色彩系統」段落** |
| **P2** | 色碼寫死（如 `color: #333`） | 深色主題完全失效 | 一律使用 `var(--color-*)`，禁止裸色碼 |
| **P3** | z-index 寫裸數字（如 `z-index: 999`） | 與 Modal/FAB/Canvas 層級衝突 | 一律使用 `var(--z-*)`。完整層級表見「Z-Index 分層系統」 |
| **P4** | No-wrap 規則放到 utilities layer | Dropdown 選單文字無法換行，泰/越語被截成亂碼 | No-wrap 必須在 **base layer**，才能被 components layer 的 dropdown 覆蓋 |
| **P5** | 使用 Font Awesome `<i class="fas">` | 違反規範 + 外連 CDN 洩漏隱私 + 多載 200-400KB | 全部用 `assets/icons/svg/` 的 inline SVG |
| **P6** | 使用 Shadow DOM Web Components | CSS Custom Properties 繼承被阻斷，主題切換壞掉 | 用 `<template>` + `cloneNode` 代替 |
| **P7** | Primary blue hover 變淺 | 對比度跌破 WCAG 4.5:1 門檻 | Hover 改用底線、背景色、box-shadow，不可降低文字色彩明度 |
| **P8** | Banner 輪播沒有暫停按鈕 | 違反 WCAG 2.2.2（自動播放需可暫停） | 加 pause/play 按鈕 + `prefers-reduced-motion` 時停止自動播放 |
| **P9** | LCP 圖片用 `loading="lazy"` | Lighthouse Performance 直接扣分 | Banner 圖片必須 `loading="eager"` + `fetchpriority="high"` |
| **P10** | `contain-intrinsic-size` 全部寫 400px | 捲軸跳動 CLS > 0.05 | 每個 section 各自設不同值（video:380/announce:600/honor:500/dept:300） |
| **P11** | Widget 自行啟動 `setInterval` | Timer 洩漏 + 背景頁籤不暫停 + 效能失控 | 透過 `refreshInterval` 宣告，由 WidgetRegistry 統一管理 |
| **P12** | 動畫未加 `prefers-reduced-motion` 守衛 | 部分使用者暈眩/癲癇觸發 | 所有 CSS animation/transition 加 `@media (prefers-reduced-motion: reduce)` 停用 |
| **P13** | `data-i18n` 替換有子元素的節點 | 圖示等子元素被 textContent 覆蓋消失 | 文字包 `<span data-i18n="key">`，圖示在 span 外面 |
| **P14** | `{{BASE_URL}}` 佔位符未被 build 替換 | 所有 SEO canonical/OG URL 壞掉 | build.sh 已含 `{{BASE_URL}}` 替換 + post-build 驗證，務必設 `BASE_URL` 環境變數 |
| **P15** | CSS Nesting 用於關鍵佈局規則 | ~8% 東南亞用戶巢狀規則被丟棄，佈局壞掉 | 關鍵佈局用平坦選擇器；nesting 僅用於 hover/focus 增強，或加 PostCSS 編譯 |
| **P16** | JS 模組橫向互相 import | 循環依賴 + 初始化順序爆炸 + 無法獨立測試 | 禁止同層橫向 import；跨模組通訊用 CustomEvent。詳見「模組依賴規則」 |
| **P17** | CSS 元件樣式寫在 base.css 或 layout.css | @layer 優先級錯亂，utilities 無法覆蓋 | 元件視覺樣式**只寫在 components.css**。詳見「CSS 四檔拆分規則」 |
| **P18** | 新增 localStorage key 未登記 | 多模組 key 衝突 + 除錯困難 | 所有 key 必須登記在「狀態管理規則」的 key 表中 |
| **P19** | HTML 缺少 CSP meta 標籤 | `data-i18n-html` 的 innerHTML 無防護，XSS 可注入腳本 | `<head>` 加入 CSP meta + innerHTML 用 DOM sanitizer（僅允許 `<br>` `<strong>` `<em>`）|
| **P20** | Auto-Modal 關閉後焦點歸還 `<body>` | 鍵盤使用者焦點迷失，Tab 從頁首重來 | 無觸發元素時焦點歸還 `#main-content`（加 `tabindex="-1"`）|
| **P21** | 越南語用 Noto Sans TC 而非 Noto Sans | 變音符號（ả ắ ặ）顯示為豆腐方塊 | `[lang="vi"]` 改用 `"Noto Sans"` + 動態載入 `subset=vietnamese` |
| **P22** | Seasonal Canvas 缺 `aria-hidden="true"` | 螢幕閱讀器朗讀無意義 Canvas 元素 | 加 `aria-hidden="true" role="presentation"` |
| **P23** | version.mjs 未驗證格式即注入 HTML | `window.__APP_VERSION__` 成 XSS 注入點 | 版號須通過 `/^\d+\.\d+\.\d+$/`，hash 通過 `/^[a-z0-9]{4,12}$/` |
| **P24** | `applyTranslations()` 未更新 `<html lang="">` | 螢幕閱讀器用錯誤語言引擎朗讀 | 語系切換必須同步更新 `document.documentElement.lang` |
| **P25** | i18n 切換未取消前次 fetch | 快速連點兩語系，後到的覆蓋先到的，語系/文字不一致 | 每次 fetch 用新 `AbortController`，發新 fetch 前 abort 前一個 |
| **P26** | Banner 輪播背景頁籤不暫停 | 隱藏頁籤持續 setInterval 浪費 CPU | banner.js 加 `visibilitychange` 監聽，hidden 時 clearInterval |
| **P27** | Modal 在 i18n 翻譯完成前彈出 | 泰/越語使用者看到中文 Modal 後閃爍切換 | i18n.js 發出 `lang:ready` 一次性事件，modal.js 等待此事件後才自動彈出 |
| **P28** | 模組直接 `fetch()` 後端 API 繞過 DataService | 快取失效 + API 替換時多處要改 + 無 fallback | 所有後端資料存取必須透過 `data-service.js`，禁止直接 fetch 後端端點 |
| **P29** | Admin token 存入 localStorage | 瀏覽器關閉後 token 殘留，其他使用者可冒用 | token 存入 `sessionStorage`，關閉即清除 + 設 expires 逾時登出 |
| **P30** | API 失敗時前台顯示空白 | 使用者看到空的公告/榮譽榜區塊 | DataService 回傳 `null` 時保留 HTML 靜態 fallback 內容，不清空 DOM |

### 快速參照卡（開發時常查）

**斷點：**
```
手機（預設）< 768px → 平板 < 1024px → 桌面 < 1280px → 大螢幕
行動優先：先寫手機版，用 min-width 擴展
```

**z-index 層級（由低到高）：**
```
--z-seasonal-canvas: 50 → --z-dropdown: 100 → --z-widget-panel: 150
→ --z-sticky-nav: 200 → --z-tooltip: 300 → --z-toast: 400
→ --z-back-to-top: 500 → --z-fab: 600 → --z-modal-overlay: 700 → --z-modal: 701
```

**色彩撰寫模式（每個 token 都必須兩段式）：**
```css
--color-example: hsl(220, 80%, 50%);                /* fallback */
@supports (color: oklch(0% 0 0)) {
  --color-example: oklch(55% 0.15 250);              /* enhancement */
}
```

**i18n 新增 key 步驟：**
```
1. zh-TW.json 加 key（主檔）
2. 其他 5 檔加同名 key + 翻譯
3. HTML 加 data-i18n="key"（純文字）/ data-i18n-placeholder / data-i18n-aria
4. node scripts/i18n-sync.mjs 驗證
```

**CSS @layer 順序與用途：**
```
@layer reset   → 瀏覽器重置
@layer base    → Custom Properties + 排版 + no-wrap 規則（在此層！）
@layer layout  → Grid/Flexbox 頁面佈局
@layer components → 元件樣式（卡片/Tab/Modal/FAB/dropdown wrap 在此覆蓋 base no-wrap）
@layer utilities → 工具類（唯一可用 !important 的層）
```

**Container Query vs Media Query：**
```
頁面佈局/section 欄數/導覽切換 → @media
卡片內部排列/Widget 內部/Tab 內容 → @container（需宣告 container-type: inline-size）
```

---

## 核心功能基線（不可刪減）

所有功能編號與詳細說明見 `docs/features.md`，以下為必須存在的功能類別：

- **N-1~N-5**: 多層級導覽 + 漢堡選單 + 回到頂部
- **C-1~C-6**: 輪播 / 快速連結 / 影音 / 分頁公告 / 榮譽榜 / 院系連結
- **S-1**: 站內搜尋
- **I-1~I-3**: 六語切換（繁體/简体/English/越語/泰語/印尼語）+ 語系記憶
- **E-1~E-5**: 學生系統 / 教職員系統 / TronClass / 社群媒體(5平台) / Email
- **A-1~A-4**: ARIA / 鍵盤導覽 / 焦點管理 / 語義化 HTML
- **W-1~W-3**: UI 控制元素禁止斷行 + ellipsis 截斷 + 行動版漢堡垂直堆疊
- **R-1~R-3**: 響應式設計（桌面 + 平板 + 手機）
- **D-1~D-2**: AJAX 動態載入
- **T-1~T-4**: 深淺主題切換 + 系統偵測 + 記憶 + 即時切換
- **M-1~M-6**: 彈跳視窗提醒（自動彈出 / ESC關閉 / 不再顯示 / 焦點鎖定 / 多則輪播 / 背景鎖定）
- **B-1~B-5**: 浮球按鈕（固定右下 / 展開選單 / 收合動畫 / 自動收合 / 行動適配）
- **SE-1~SE-10**: 季節特效（Canvas 粒子引擎 / 四季配置 / 使用者開關 / 效能保護 / 外掛式擴充）
- **WG-1~WG-8**: 小工具系統（Registry 外掛架構 / 日曆含農曆 / 時鐘 / 天氣 / 假日倒數 / 面板 UI）
- **V-1~V-4**: 版號系統（語義化版號 / Build Script / 快取破壞 / 版號可見）
- **P-1~P-8**: 加載速度架構（Critical CSS / modulepreload / skeleton / content-visibility / 快取策略）
- **SEO-1~SEO-8**: SEO 與 AI 搜尋（Meta / OG / JSON-LD / hreflang / sitemap / 語義化 HTML）
- **CMS-1~CMS-12**: 管理後台對接（登入/公告/榮譽榜/Banner/檔案/圖片/成員/API 抽象/快取/fallback）
- **F-1~F-4**: 頁尾聯絡/連結/版權

任何改版或新增功能，都不得移除上述基線功能。

---

## 技術棧規範

### HTML

- 使用 HTML5 語義標籤：`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- 所有互動元件必須包含 ARIA 屬性（`aria-label`, `aria-expanded`, `aria-selected`, `role`）
- 圖片必須包含 `alt`，裝飾性圖片用 `alt=""`
- 使用 `<picture>` + `<source>` 做響應式圖片，提供 WebP 格式

### 圖示系統 — SVG 向量圖優先

```
禁止使用 Font Awesome、Material Icons 等圖示字型。
所有圖示一律使用 inline SVG 或 SVG sprite。
```

**SVG 圖示規範：**

| 規則 | 說明 |
|------|------|
| 格式 | 所有圖示為獨立 `.svg` 檔案，存放於 `assets/icons/svg/` |
| 尺寸 | 統一 viewBox `0 0 24 24`，不寫死 width/height，由 CSS 控制尺寸 |
| 著色 | 使用 `stroke="currentColor"` 或 `fill="currentColor"`，由父元素 CSS `color` 繼承 |
| 引用方式 | 首選 inline SVG（直接貼入 HTML）；重複使用的圖示用 SVG sprite `<use href="#id">` |
| 無障礙 | 功能性圖示加 `aria-label`；裝飾性圖示加 `aria-hidden="true"` |
| 命名 | kebab-case：`nav-home.svg`, `brand-facebook.svg`, `chevron-down.svg` |
| 深淺主題 | 因使用 `currentColor`，SVG 顏色自動隨主題 CSS 變數切換，無需額外處理 |

**已建立的 SVG 圖示清單（共 33 個）：**

| 類別 | 圖示 |
|------|------|
| 導覽 | `nav-home` `menu` `close` `chevron-up` `chevron-down` `chevron-left` `chevron-right` `arrow-up` `external-link` |
| 功能 | `search` `sun` `moon` `globe` `play` `plus` `download` |
| 內容 | `trophy` `award` `graduation-cap` `users` `book-open` `briefcase` `file-text` `megaphone` |
| 聯絡 | `phone` `mail` `map-pin` `fax` |
| 社群品牌 | `brand-line` `brand-facebook` `brand-instagram` `brand-threads` `brand-tiktok` |

新增圖示時遵循同樣規範放入 `assets/icons/svg/`。

### 圖片資源 — 原站下載 + 本機管理

```
禁止外連原站圖片（避免跨域與失效）。
所有圖片下載至本機 assets/images/ 目錄後引用。
```

**圖片管理規則：**

| 規則 | 說明 |
|------|------|
| 來源 | 原站圖片已下載至 `assets/images/original/` |
| 格式 | 優先提供 WebP 格式 + PNG/JPG fallback，使用 `<picture>` 標籤 |
| 命名 | 語義化 kebab-case：`student-system.png`、`social-line.png` |
| 尺寸 | 提供 1x / 2x 版本，或使用 `srcset` 做響應式切換 |
| 懶載入 | 非首屏圖片加 `loading="lazy"` |
| 新圖片 | 需要新增圖片時，先從原站下載或自行製作，存入 `assets/images/` |

**已下載的原站圖片：**

```
assets/images/original/
├── banner.png            # 系所 Banner 橫幅
├── student-system.png    # 學生資訊系統入口圖
├── staff-system.png      # 教職員資訊系統入口圖
├── tronclass.png         # TronClass 教學平台圖
├── classroom.png         # 專業教室介紹圖
├── competitions.png      # 競賽活動圖
├── social-line.png       # LINE 社群圖
├── social-facebook.png   # Facebook 社群圖
├── social-instagram.png  # Instagram 社群圖
├── social-threads.png    # Threads 社群圖
└── social-tiktok.png     # TikTok 社群圖
```

### CSS — 現代技術優先

```
優先順序：原生 CSS 新特性 > 輕量工具類 > 第三方框架
```

**必須使用的現代 CSS 技術：**

| 技術 | 用途 |
|------|------|
| **CSS Custom Properties** | 全站色彩、字級、間距變數，支援主題切換 |
| **CSS Grid** | 頁面主佈局、卡片網格、頁尾多欄 |
| **CSS Flexbox** | 導覽列、行內排列、元件內部佈局 |
| **CSS Container Queries** | 元件級響應式（取代部分 media query） |
| **CSS Scroll-driven Animations** | 滾動觸發動畫（漸進增強，需 `@supports` 守衛，Fallback 用 Intersection Observer） |
| **CSS `@layer`** | 樣式層級管理：reset → base → layout → components → utilities |
| **CSS Nesting** | 原生巢狀選擇器，取代 SASS 巢狀 |
| **CSS `color-mix()` / `oklch()`** | 現代色彩系統 |
| **CSS `has()` / `:is()` / `:where()`** | 進階選擇器簡化樣式邏輯 |
| **CSS View Transitions API** | 頁面/元件切換過場動畫（漸進增強，需 `@supports (view-transition-name: foo)` 守衛） |
| **CSS `@property`** | 自訂屬性類型註冊，實現漸層動畫等 |
| **CSS `text-wrap: balance`** | 標題文字自動平衡換行 |
| **CSS Subgrid** | 巢狀網格對齊 |

**CSS 架構規則：**

- 使用 `@layer` 分層：`@layer reset, base, layout, components, utilities;`
- 所有顏色定義在 `:root` 的 CSS Custom Properties 中，支援 light/dark 主題
- 不使用 `!important`（utilities 層除外）
- class 命名使用 BEM 變體：`block__element--modifier`
- 動畫優先使用 `transform` 和 `opacity`，避免觸發 layout reflow
- 所有過渡效果使用 `prefers-reduced-motion` 媒體查詢提供降級方案
- 不使用 CSS 預處理器（SASS/LESS），全部使用原生 CSS

**禁止斷行規則（No-Wrap Policy）：**

所有 UI 控制元素與短文本一律禁止斷行換行：

```css
/* 以下元素必須套用 */
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis; /* 溢出時顯示 ... */
```

| 適用範圍 | 說明 |
|----------|------|
| 主導覽選單項目 | 頂層選單文字不換行 |
| 按鈕文字 | 所有 `<button>`、`.btn` 類別文字不換行 |
| Tab 分頁標籤 | 分頁切換標籤文字不換行 |
| 快速連結標題 | 4 宮格卡片標題不換行 |
| 日期標籤 | 公告日期、榮譽榜日期不換行 |
| 浮球選單標籤 | FAB 展開的子項文字不換行 |
| 語系切換標籤 | 6 語切換按鈕文字不換行 |
| 主題切換標籤 | Light/Dark 切換文字不換行 |
| 標籤/Badge | 所有標籤性質元素不換行 |
| 麵包屑 | 麵包屑導覽各節點不換行 |

容器不足時的處理策略（依優先順序）：
1. 容器自動撐寬（flex/grid 允許時）
2. `text-overflow: ellipsis` 截斷顯示
3. **絕對禁止**自動斷行到下一行

**允許換行的例外情況**（經審計確認必要）：

| 允許換行範圍 | 原因 |
|-------------|------|
| 下拉選單內的項目 | 學術名稱過長（如「重、補修必修科目與修習新舊課程處理方式」16 字），越/泰語翻譯會再膨脹 40~60%。設 `min-width: 280px; max-width: 360px; white-space: normal;` |
| 頁尾地址文字 | 完整地址需自然換行 |
| 段落內文 `<p>` | 自然換行 |
| 文章內容 `<article>` | 自然換行 |
| 行動版導覽 | 使用漢堡選單的垂直堆疊，**不使用水平滑動**（水平滑動會隱藏項目，損害可發現性） |

### JavaScript — 原生 ES Module 優先

```
優先順序：原生 Web API > 輕量庫 > 框架
```

**必須使用的現代 JS 技術：**

| 技術 | 用途 |
|------|------|
| **ES Modules** (`import`/`export`) | 模組化架構 |
| **Intersection Observer** | 滾動觸發動畫、懶載入 |
| **View Transitions API** | 頁面切換動畫 |
| **Web Animations API** | 複雜動畫控制（取代 CSS animation 不足處） |
| **`<template>` + cloneNode** | 可重用元件渲染（公告卡片、榮譽項目），不使用 Shadow DOM |
| **Template Literals** | 動態 HTML 生成 |
| **Fetch API + async/await** | AJAX 資料載入 |
| **Event Delegation** | 效能優化的事件處理 |
| **ResizeObserver** | 響應式行為偵測 |
| **Scroll Timeline API** | 搭配 CSS scroll-driven animations |
| **URLSearchParams** | 語系切換與路由參數處理 |
| **localStorage** | 使用者偏好儲存（語系、主題、彈窗不再顯示） |
| **Focus Trap（原生實作）** | 彈跳視窗焦點鎖定循環 |
| **AbortController** | 管理事件監聽器的生命週期（Modal/FAB 開關時） |

**JS 架構規則：**

- 所有 JS 以 ES Module 形式組織，一個功能一個模組
- 不使用 jQuery — 全部使用原生 DOM API
- 不使用前端框架（React/Vue/Angular），保持原生輕量
- 使用 `defer` 載入 script，不阻塞渲染
- 動態載入非首屏模組：`import()` 懶載入
- 事件監聽統一使用 `addEventListener`，需要時用 `AbortController` 管理
- 所有非同步操作使用 `async/await`，搭配 `try/catch` 錯誤處理

---

## 檔案結構

```
朝陽/
├── index.html                  # 首頁（含 {{VERSION}} 佔位符，build 時注入）
├── CLAUDE.md                   # 本文件（專案規範）
├── version.json                # 版號來源（MAJOR.MINOR.PATCH + buildHash）
├── robots.txt                  # 爬蟲指引
├── sitemap.xml                 # 全站頁面清單（SEO）
├── scripts/
│   ├── version.mjs             # 版號遞增腳本（node scripts/version.mjs patch）
│   ├── build.sh                # 一鍵 build（版號注入 + CSS 合併 + WebP + SVG 壓縮）
│   └── i18n-sync.mjs           # i18n Key 同步檢查（比對 6 語 JSON missing/extra/empty keys）
├── docs/
│   └── features.md             # 核心功能清單（基線）
├── css/
│   ├── base.css                # @layer reset/base — custom properties + 雙主題色彩 + 排版 + no-wrap 規則
│   ├── layout.css              # @layer layout — Grid/Flexbox 頁面佈局
│   ├── components.css          # @layer components — 卡片/Tab/輪播/Modal/FAB 等元件
│   └── utilities.css           # @layer utilities — 工具類別
├── js/
│   ├── main.js                 # 進入點，載入各模組
│   ├── modules/
│   │   ├── navigation.js       # 導覽列 + 漢堡選單
│   │   ├── banner.js           # 輪播功能
│   │   ├── tabs.js             # 分頁切換
│   │   ├── scroll-effects.js   # 滾動觸發動畫（Intersection Observer）
│   │   ├── search.js           # 搜尋功能
│   │   ├── i18n.js             # 六語切換 + localStorage 記憶
│   │   ├── theme.js            # 深淺主題切換 + 系統偵測 + localStorage 記憶
│   │   ├── modal.js            # 彈跳視窗提醒（焦點鎖定/ESC/不再顯示/多則輪播）
│   │   ├── fab.js              # 浮球按鈕（展開/收合/自動收合）
│   │   ├── widget-registry.js  # Widget 核心 registry（註冊式外掛架構）
│   │   └── seasonal/           # 季節特效系統
│   │       ├── index.js        # 季節偵測 + 動態載入
│   │       ├── engine.js       # Canvas 粒子引擎核心
│   │       ├── spring.js       # 春：花瓣飄落
│   │       ├── summer.js       # 夏：飛鳥 + 光斑
│   │       ├── autumn.js       # 秋：落葉搖擺
│   │       └── winter.js       # 冬：雪花飄落
│   ├── widgets/                # 小工具（外掛式，符合 Widget 介面）
│   │   ├── index.js            # 匯入並註冊所有 widget
│   │   ├── calendar.js         # 日曆（含農曆查表法）
│   │   ├── clock.js            # 即時時鐘
│   │   ├── weather.js          # 天氣預報卡
│   │   └── holiday-countdown.js # 國定假日倒數
│   └── templates/              # <template> 元素的 JS 渲染邏輯
│       ├── announcement-card.js # 公告卡片（<template> + cloneNode）
│       └── honor-item.js        # 榮譽項目（<template> + cloneNode）
├── i18n/
│   ├── zh-TW.json              # 繁體中文（主檔）
│   ├── zh-CN.json              # 简体中文
│   ├── en.json                 # English
│   ├── vi.json                 # Tiếng Việt
│   ├── th.json                 # ภาษาไทย
│   └── id.json                 # Bahasa Indonesia
├── assets/
│   ├── images/                 # 圖片（提供 WebP 版本）
│   ├── icons/                  # SVG 圖示
│   └── fonts/                  # 網頁字型（Noto Sans Thai 等）
└── pages/                      # 子頁面
    ├── about.html              # 系所簡介
    ├── curriculum.html         # 課程規劃
    ├── internship.html         # 實習專區
    ├── certification.html      # 證照專區
    ├── downloads.html          # 下載專區
    ├── admission.html          # 招生資訊
    ├── regulations.html        # 規章辦法
    ├── programs.html           # 專班專區
    └── alumni.html             # 系友專區
```

---

## 模組化架構與拆分規則

> 本段定義所有 CSS/JS/HTML 的拆分邊界、依賴方向、載入策略與通訊機制。
> 新增任何模組前必須先讀完本段。

### CSS 四檔拆分規則

每支 CSS 檔對應一個 `@layer`，職責嚴格劃分：

| 檔案 | @layer | 職責範圍 | 可以引用 | 不可包含 |
|------|--------|----------|----------|----------|
| `base.css` | reset, base | CSS Reset、`:root` Custom Properties（色彩/字型/間距/圓角/z-index/shadow 全部在此）、排版基礎、no-wrap 規則、`@supports` fallback、print stylesheet | 無依賴 | 任何具體元件樣式、BEM class |
| `layout.css` | layout | 頁面骨架：`.outer` 容器、Grid/Flexbox 主佈局、`<header>`/`<main>`/`<footer>` 定位、section 間距、`content-visibility`、`container-type` 宣告、斷點 media query | `var(--*)` from base | 元件視覺樣式、hover/focus 狀態 |
| `components.css` | components | 所有 BEM 元件：`.nav__*`、`.banner__*`、`.tab__*`、`.card__*`、`.modal__*`、`.fab__*`、`.widget-panel__*`、`.skeleton`、dropdown 換行覆蓋 | `var(--*)` from base | 佈局結構（Grid 定義）、Custom Properties 定義 |
| `utilities.css` | utilities | 單一功能工具類：`.u-hidden`、`.u-sr-only`、`.u-mt-lg`、`.u-text-center`，唯一可用 `!important` | `var(--*)` from base | 多屬性組合、元件邏輯 |

**拆分判斷流程：**
```
這段 CSS 定義變數或重置？ → base.css
這段 CSS 決定元素在頁面中的位置？ → layout.css
這段 CSS 決定元素長什麼樣子？ → components.css
這段 CSS 是一個可重用的單屬性 class？ → utilities.css
```

**跨層規則：**
- 低層不可引用高層的 class（base 不可依賴 components 的 class）
- 高層可覆蓋低層的值（components 可覆蓋 base 的 no-wrap）
- `!important` 僅允許在 utilities 層和 `@media print` 中

### JS 模組分層架構

```
┌──────────────────────────────────────────────────────┐
│                    main.js（入口）                     │
│  職責：讀取 DOM Ready → 依序初始化各模組               │
│  只做 import + init()，不含業務邏輯                    │
├──────────┬──────────┬──────────┬─────────────────────┤
│ 靜態 import（首屏必需）      │ 動態 import()（非首屏）   │
│          │          │          │                     │
│ theme.js │ nav.js   │banner.js │ scroll-effects.js   │
│ i18n.js  │ tabs.js  │          │ search.js           │
│          │          │          │ modal.js             │
│          │          │          │ fab.js               │
│          │          │          │ seasonal/index.js    │
│          │          │          │ widget-registry.js   │
├──────────┴──────────┴──────────┴─────────────────────┤
│                 templates/（渲染輔助）                  │
│  announcement-card.js / honor-item.js                │
│  由 tabs.js / scroll-effects.js 按需 import           │
├──────────────────────────────────────────────────────┤
│                 widgets/（外掛，由 registry 管理）       │
│  calendar.js / clock.js / weather.js / holiday.js    │
│  全部由 widgets/index.js 批次註冊                      │
├──────────────────────────────────────────────────────┤
│              seasonal/（外掛，由 index.js 管理）        │
│  engine.js ← spring.js / summer.js / autumn.js / ... │
│  季節配置由 seasonal/index.js 依日期動態 import          │
└──────────────────────────────────────────────────────┘
```

### JS 模組依賴規則（誰可以 import 誰）

```
允許方向：上層 → 下層（main → modules → templates/widgets/seasonal）
禁止方向：下層 → 上層（widget 不可 import navigation.js）
禁止方向：同層橫向 import（navigation.js 不可 import banner.js）
```

**完整依賴矩陣：**

| 模組 | 可以 import | 不可 import |
|------|------------|------------|
| `main.js` | 所有 modules/* | — |
| `theme.js` | 無（獨立） | 其他任何 module |
| `i18n.js` | 無（獨立） | 其他任何 module |
| `navigation.js` | 無（獨立） | banner.js, tabs.js 等同層 |
| `banner.js` | 無（獨立） | 其他任何 module |
| `tabs.js` | `templates/announcement-card.js` | navigation.js 等同層 |
| `scroll-effects.js` | `templates/honor-item.js` | 其他 module |
| `search.js` | 無（獨立） | 其他任何 module |
| `modal.js` | 無（獨立） | 其他任何 module |
| `fab.js` | 無（獨立） | 其他任何 module |
| `widget-registry.js` | `widgets/index.js` | 具體 widget 的內部實作 |
| `seasonal/index.js` | `seasonal/engine.js`, `seasonal/*.js` | 其他 module |
| `widgets/*.js` | 無（獨立，由 registry 管理） | 其他 widget、其他 module |
| `templates/*.js` | 無（純渲染函數） | 任何 module |

**違反規則的徵兆：** 如果發現需要橫向 import（如 `banner.js` 想呼叫 `i18n.js` 的翻譯功能），代表需要透過**事件通訊**或**main.js 協調**，而非直接引用。

### JS 模組載入策略

| 模組 | 載入方式 | 時機 | 原因 |
|------|----------|------|------|
| `theme.js` | **靜態 import** + `modulepreload` | DOMContentLoaded | 綁定切換按鈕 + 監聯系統主題變更 + 發送 `theme:changed` 事件（閃爍防止由 `<head>` inline script 處理）|
| `i18n.js` | **靜態 import** + `modulepreload` | DOMContentLoaded | 首屏文字需立即翻譯 |
| `navigation.js` | **靜態 import** + `modulepreload` | DOMContentLoaded | 首屏導覽必須可操作 |
| `banner.js` | **靜態 import** + `modulepreload` | DOMContentLoaded | LCP 元素需立即輪播 |
| `tabs.js` | **動態 `import()`** | `#announcements` 進入 viewport（IntersectionObserver）| 公告區塊有 content-visibility:auto，屬首屏外 |
| `scroll-effects.js` | **動態 `import()`** | 首次捲動或 idle | 非首屏，延遲不影響體驗 |
| `search.js` | **動態 `import()`** | 搜尋框獲得焦點時 | 低頻操作 |
| `modal.js` | **動態 `import()`** | DOMContentLoaded + idle | 需判斷是否彈出，但非阻塞 |
| `fab.js` | **動態 `import()`** | DOMContentLoaded + idle | 視覺在首屏但互動非緊急 |
| `widget-registry.js` | **動態 `import()`** | Widget 面板首次開啟 | 使用者未開面板就不載入 |
| `seasonal/index.js` | **動態 `import()`** | requestIdleCallback | 最低優先級，裝飾性功能 |

### JS 模組介面規範

每個 module 必須 export 一個 `init()` 函數作為唯一入口：

```javascript
// js/modules/navigation.js
const SELECTORS = {
  nav: '#main-nav',
  toggle: '.nav-toggle',
  list: '.nav-list',
};

function init() {
  const nav = document.querySelector(SELECTORS.nav);
  if (!nav) return; // 防禦性：若 DOM 不存在則靜默退出
  // ... 初始化邏輯
}

export { init };
```

**模組介面契約：**

| 規則 | 說明 |
|------|------|
| 唯一出口 | 每個**由 main.js 呼叫的頂層模組** export `{ init }` 或 `{ init, destroy }`。子模組（`seasonal/engine.js`、`templates/*.js`、`widgets/*.js`）可用 class export 或其他介面，由其父模組封裝 |
| DOM 選擇器集中 | 所有 CSS selector 集中在模組頂部的 `SELECTORS` 常量 |
| 防禦性初始化 | `init()` 開頭檢查目標 DOM 是否存在，不存在則 `return`，不 throw |
| 不汙染全域 | 禁止寫入 `window.*`（`window.__APP_VERSION__` 是唯一例外，由 HTML 設定） |
| 不直接操作其他模組的 DOM | navigation.js 不可 `querySelector('.banner__slide')` |
| 事件監聽可清理 | 使用 `AbortController` 管理 event listener，`destroy()` 時 abort |

### JS 模組間通訊機制

模組之間**禁止直接 import**。需要跨模組溝通時，使用以下機制：

**機制一：Custom Event（推薦，適用大多數場景）**

```javascript
// i18n.js — 語系切換後廣播
document.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang: 'vi' } }));

// navigation.js — 監聽並更新
document.addEventListener('lang:changed', (e) => {
  // 重新渲染導覽文字
});
```

**已定義的全站事件名稱：**

| 事件名 | 發送者 | 資料 | 監聽者 |
|--------|--------|------|--------|
| `lang:ready` | i18n.js | `{ lang: 'vi' }` | modal.js（等待此事件後才自動彈出）— **一次性事件**，首次翻譯載入完成時發送 |
| `lang:changed` | i18n.js | `{ lang: 'vi' }` | 所有需翻譯的模組（含 navigation.js、banner.js 等有 data-i18n 的模組）+ widget-registry |
| `theme:changed` | theme.js | `{ theme: 'dark' }` | widget-registry + seasonal |
| `modal:opened` | modal.js | `{ id: 'announce-1' }` | fab.js（隱藏 FAB 避免遮擋）|
| `modal:closed` | modal.js | `{}` | fab.js（恢復 FAB）|
| `widget-panel:toggled` | widget-registry.js | `{ open: true }` | widget-registry.js 自身（toggle `<body>` 的 `.widget-open` class，由 layout.css 定義 padding-right）|

**機制二：main.js 協調（適用初始化順序依賴）**

```javascript
// main.js
import { init as initTheme } from './modules/theme.js';
import { init as initI18n } from './modules/i18n.js';
import { init as initNav } from './modules/navigation.js';
import { init as initBanner } from './modules/banner.js';
import { init as initTabs } from './modules/tabs.js';

// 初始化順序有意義：theme → i18n（async）→ 導覽 → 輪播
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();           // 1. 綁定切換按鈕（閃爍防止由 head inline script 處理）
  await initI18n();      // 2. 翻譯 — await 確保首屏文字翻譯完成後才繼續
                         //    initI18n 內部發送 lang:ready 事件
  initNav();             // 3. 導覽（翻譯已完成，nav 文字正確）
  initBanner();          // 4. 輪播

  // 非首屏模組延遲載入
  requestIdleCallback(async () => {
    const { init: initModal } = await import('./modules/modal.js');
    // modal.js 內部監聽 lang:ready，此時事件已發送，modal 直接讀取當前語系
    const { init: initFab } = await import('./modules/fab.js');
    initModal();
    initFab();
  });

  // 捲動觸發載入（tabs + scroll-effects 共用 observer）
  const lazyObserver = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = entry.target.id;
      if (id === 'announcements') {
        const { init } = await import('./modules/tabs.js');
        init();
      }
      if (id === 'video-section') {
        const { init } = await import('./modules/scroll-effects.js');
        init();
        lazyObserver.disconnect();
      }
    }
  });
  document.querySelectorAll('#announcements, #video-section').forEach(el => lazyObserver.observe(el));
});
```

### HTML section ↔ JS module 掛載映射

每個 HTML `data-section` 對應一個 JS 模組負責其行為：

| HTML `data-section` | JS 模組 | 掛載方式 |
|---------------------|---------|----------|
| `#site-header` | `i18n.js`（翻譯）+ `search.js`（搜尋框）| 靜態 |
| `#main-nav` | `navigation.js` | 靜態 |
| `#hero-banner` | `banner.js` | 靜態 |
| `#quick-links` | `i18n.js`（翻譯）| 靜態 |
| `#social-bar` | 無專屬 JS（純 HTML 連結）| — |
| `#video-section` | `scroll-effects.js`（進場動畫）| 動態（IntersectionObserver）|
| `#announcements` | `tabs.js` + `templates/announcement-card.js` | 靜態 + 按需渲染 |
| `#honor-roll` | `scroll-effects.js` + `templates/honor-item.js` | 動態 |
| `#college-depts` | `scroll-effects.js`（進場動畫）| 動態 |
| `#site-footer` | `i18n.js`（翻譯）| 靜態 |
| `#seasonal-canvas` | `seasonal/index.js` → `engine.js` | 動態（idle）|
| `#back-to-top` | `scroll-effects.js` | 動態 |
| `#fab` | `fab.js` | 動態（idle）|
| `#modal-overlay` | `modal.js` | 動態（idle）|
| `#widget-panel` | `widget-registry.js` → `widgets/*` | 動態（使用者開啟時）|

### 狀態管理規則

本專案不使用全域狀態管理庫。狀態分為三類：

| 狀態類型 | 儲存位置 | 讀寫者 | 範例 |
|----------|----------|--------|------|
| **持久偏好** | `localStorage` | 寫入者唯一，讀取者多個 | `theme`（theme.js 寫）、`lang`（i18n.js 寫）、`seasonal-enabled`（seasonal 寫）、`widget-*-enabled`（registry 寫）、`modal-dismiss-{hash}`（modal.js 寫）|
| **頁面狀態** | DOM 屬性 | 各模組各自管理 | `data-theme`（html）、`aria-expanded`（nav）、`aria-selected`（tab）|
| **暫態資料** | 模組內部閉包 | 僅該模組 | 輪播 currentSlide、粒子陣列、timer ID |

**localStorage key 命名規範：**

| Key | 模組 | 值 |
|-----|------|-----|
| `theme` | theme.js | `'light'` \| `'dark'` |
| `lang` | i18n.js | `'zh-TW'` \| `'zh-CN'` \| `'en'` \| `'vi'` \| `'th'` \| `'id'` |
| `seasonal-enabled` | seasonal/index.js | `'true'` \| `'false'` |
| `modal-dismiss-{hash}` | modal.js | `'1'` |
| `widget-{id}-enabled` | widget-registry.js | `'true'` \| `'false'` |
| `weather-cache` | widgets/weather.js | JSON string + timestamp |

**禁止新增未在此表登記的 localStorage key。**

### 新增模組 checklist

新增一個 JS 模組時，依序完成以下步驟：

```
1. [ ] 在 js/modules/ 建立 {name}.js，export { init } 或 { init, destroy }
2. [ ] 頂部定義 SELECTORS 常量
3. [ ] init() 開頭做 DOM 存在性檢查
4. [ ] 決定載入策略：靜態 or 動態（加入上方載入策略表）
5. [ ] 在 main.js 中 import 並呼叫 init()（靜態）或 import()（動態）
6. [ ] 若需跨模組通訊：定義 CustomEvent 名稱（加入上方事件表）
7. [ ] 若需 localStorage：登記 key（加入上方 key 表）
8. [ ] 若有對應 HTML section：加入掛載映射表
9. [ ] 對應的 CSS 樣式寫入 components.css（@layer components）
10. [ ] 若有可翻譯文字：新增 i18n key → 執行 i18n-sync.mjs
11. [ ] 測試：prefers-reduced-motion / 深色主題 / 行動裝置 / 無 JS 降級
```

### 新增 CSS 元件 checklist

```
1. [ ] 在 components.css 的 @layer components 中撰寫
2. [ ] class 命名遵循 BEM：.block__element--modifier
3. [ ] 所有顏色用 var(--color-*)，圓角用 var(--radius-*)，間距用 var(--space-*)
4. [ ] 所有 z-index 用 var(--z-*)
5. [ ] 若需響應式：判斷用 @media（頁面佈局）或 @container（元件內部）
6. [ ] hover/focus 狀態加 prefers-reduced-motion 守衛
7. [ ] 測試深色主題下的外觀
8. [ ] 測試 print（確認在 @media print 中被隱藏或正確呈現）
```

### 模組實作補充規則（第四次審計共識）

#### i18n.js — async 初始化 + AbortController

```javascript
// i18n.js 必須 export async function init()
let currentController = null;

export async function init() {
  const lang = detectLanguage(); // URL > localStorage > navigator > 'zh-TW'
  await loadAndApply(lang);
  document.dispatchEvent(new CustomEvent('lang:ready', { detail: { lang } }));
}

async function loadAndApply(lang) {
  if (currentController) currentController.abort(); // 取消前次請求
  currentController = new AbortController();
  const res = await fetch(`i18n/${lang}.json`, { signal: currentController.signal });
  const translations = await res.json();
  applyTranslations(translations);
}
```

- `init()` 回傳 Promise，main.js 用 `await initI18n()` 確保翻譯完成後才初始化後續模組
- 快速連點語系時，AbortController 取消前次 fetch（防止 P25 競態）
- 首次載入完成後發送 `lang:ready` 一次性事件（modal.js 等待此事件才自動彈出，防止 P27）

#### banner.js — visibilitychange 暫停

```javascript
// banner.js init() 中
let autoTimer;
function startAuto() { autoTimer = setInterval(() => goNext(), 5000); }
function stopAuto() { clearInterval(autoTimer); }

document.addEventListener('visibilitychange', () => {
  document.hidden ? stopAuto() : startAuto();
});

// prefers-reduced-motion 檢查
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  stopAuto(); // 不自動播放
}
```

#### Widget 初始狀態取得

Widget 的 `init(container)` 被 registry 呼叫時，registry 傳入當前狀態：

```javascript
// widget-registry.js 內部
widget.init(wrapperDiv);
widget.onThemeChange?.(document.documentElement.dataset.theme || 'light');
widget.onLanguageChange?.(document.documentElement.lang || 'zh-Hant');
```

Widget 不需自行讀取 DOM 狀態，registry 統一注入。後續切換透過 `theme:changed` / `lang:changed` 事件回呼。

#### 子頁面結構規則

所有頁面（`index.html` 及 `pages/*.html`）共用相同的 `#site-header`、`#main-nav`、`#site-footer` HTML 結構。差異僅在 `<main>` 內容區。實作時將 header/nav/footer 視為共用模板。

#### 元素 ID vs Class 規則

HTML 實作時：區塊級容器使用 `id`（供 JS 選取 + 錨點導覽），視覺樣式使用 `class`（供 CSS 選擇）。例：

```html
<nav id="main-nav" class="nav">  <!-- id 給 JS，class 給 CSS -->
```

模組 SELECTORS 統一使用 `#id` 選取容器，不用 `.class`。

#### CSS position 歸屬

| 屬性 | 歸屬 CSS 檔 | 原因 |
|------|-------------|------|
| `position: sticky / fixed` | layout.css | 決定元素在頁面中的位置 |
| `z-index: var(--z-*)` | layout.css | 層級定位 |
| `background / color / border` | components.css | 視覺呈現 |
| `hover / focus / active 狀態` | components.css | 互動視覺 |

#### 動畫定義（開發者實作參考）

| 元件 | 動畫效果 | `prefers-reduced-motion` 降級 |
|------|----------|------------------------------|
| Dropdown 展開 | `opacity: 0→1` + `translateY(-8px→0)`，150ms ease-out | 直接切換 `visibility`，無動畫 |
| 漢堡選單展開 | `max-height: 0→auto`，300ms ease | 即時切換 `display`，無動畫 |
| FAB 展開 | 子項 `scale(0)→scale(1)` + `opacity: 0→1`，主按鈕旋轉 45°，150ms | 直接切換 `visibility` |
| Modal 開啟 | 遮罩 `opacity: 0→1` + 面板 `scale(0.95)→scale(1)` + `opacity: 0→1`，300ms | 直接切換 `visibility` |
| Theme 切換 | 10 個主要 surface 元素 `background-color` + `color` transition 300ms，透過 `.theme-transitioning` class 暫時施加 | 無 transition，直接切換 |
| Banner 輪播 | `translateX` 滑動，600ms ease | 直接切換，無滑動 |
| Skeleton 脈衝 | `::after` 偽元素 `translateX(-100%→100%)`，1.5s infinite | `animation: none` |

#### 無 JS 降級合格標準

「無 JS 降級」測試的 PASS 定義：
1. 所有靜態 HTML（標題、導覽連結、頁尾資訊）可讀
2. 骨架屏可見但不影響閱讀
3. 無 JS 錯誤（console 乾淨）
4. 核心資訊（系所名稱、聯絡方式、選單連結）不依賴 JS 渲染即可閱讀
5. `<noscript>` 確保 CSS 正常載入

#### navigation.js 不使用 localStorage

漢堡選單每次頁面載入預設收合（`aria-expanded="false"`），不跨頁保持展開狀態。

---

## 設計規範

### 色彩系統 — 深淺雙主題 (CSS Custom Properties)

透過 `[data-theme="light"]` / `[data-theme="dark"]` 在 `<html>` 上切換。

#### Light Theme — Apple 白色簡約風

設計原則參照 Apple 官網風格：

- **大量留白**：區塊間距寬裕，內容不擁擠，呼吸感充足
- **純白底色**：主背景 `#ffffff`，區塊分層用極淡灰 `#f5f5f7` 交替
- **極細邊框**：邊框幾乎不可見（`oklch(92%)` 以上），以陰影取代粗邊框
- **柔和陰影**：多層低透明度陰影模擬自然光照立體感
- **高對比文字**：標題接近純黑 `oklch(13%)`，內文 `oklch(25%)`，層次鮮明
- **色彩節制**：主色只用於 CTA 按鈕和互動重點，90% 頁面為黑白灰
- **圓角統一**：卡片 12px → 16px，按鈕 8px → 12px，輸入框 8px，風格柔和統一
- **字重層次**：標題 600~700，內文 400，輔助文字 400 + 較淺色

**!! 陷阱 P1：以下所有 oklch() 值必須搭配 hsl() fallback。實作時用兩段式：先定義 hsl fallback，再用 `@supports (color: oklch(...))` 覆蓋。詳見「致命陷阱速查表 P1」和「第三次審計 > 一、oklch fallback」。以下列出的 oklch 值是目標值，對應的 hsl fallback 值需於 base.css 實作時補齊。**

```css
/* ===== Light Theme — Apple 簡約白 ===== */
/* 實作時先寫 hsl() fallback 區塊，再用 @supports (color: oklch(50% 0.14 250)) 覆蓋 */
:root,
[data-theme="light"] {
  /* 主色 — 節制使用，僅用於 CTA 與互動重點 */
  /* hsl fallback: hsl(220, 100%, 44%) → oklch 增強如下 */
  --color-primary: oklch(50% 0.14 250);
  --color-primary-light: oklch(95% 0.02 250);
  --color-primary-dark: oklch(40% 0.16 250);
  --color-primary-hover: oklch(45% 0.16 250);

  /* 強調色 */
  --color-accent: oklch(65% 0.16 145);
  --color-accent-hover: oklch(55% 0.18 145);

  /* 語義色 */
  --color-success: oklch(55% 0.16 145);
  --color-warning: oklch(70% 0.15 80);
  --color-error: oklch(55% 0.20 25);
  --color-info: oklch(55% 0.12 250);

  /* 表面與背景 — Apple 風格分層 */
  --color-bg: #ffffff;
  --color-bg-alt: oklch(98% 0.005 80);          /* 微暖灰 #faf9f7（非冷灰 #f5f5f7），為學術網站注入溫度 */
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-surface-hover: oklch(97% 0.003 265);

  /* 邊框 — 極淡，幾乎不可見 */
  --color-border: oklch(92% 0 0);
  --color-border-subtle: oklch(95% 0 0);
  --color-divider: oklch(94% 0 0);

  /* 文字 — 高對比層次 */
  --color-text: oklch(13% 0 0);                /* 接近純黑 */
  --color-text-secondary: oklch(35% 0 0);
  --color-text-muted: oklch(50% 0 0);           /* 修正：55%→50% 確保 4.5:1 對比 (WCAG AA) */
  --color-text-placeholder: oklch(63% 0 0);     /* 修正：70%→63% 確保 3:1 對比 */

  /* 陰影 — 多層柔和陰影模擬自然光 */
  --shadow-xs: 0 1px 2px oklch(0% 0 0 / 0.04);
  --shadow-sm: 0 1px 3px oklch(0% 0 0 / 0.06), 0 1px 2px oklch(0% 0 0 / 0.04);
  --shadow-md: 0 4px 6px oklch(0% 0 0 / 0.05), 0 2px 4px oklch(0% 0 0 / 0.03);
  --shadow-lg: 0 10px 25px oklch(0% 0 0 / 0.07), 0 4px 10px oklch(0% 0 0 / 0.04);
  --shadow-xl: 0 20px 50px oklch(0% 0 0 / 0.08), 0 8px 20px oklch(0% 0 0 / 0.04);

  /* 遮罩 */
  --overlay-bg: oklch(0% 0 0 / 0.4);
  --overlay-blur: blur(20px);                   /* Apple 毛玻璃效果 */

  /* 圓角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

#### Light Theme oklch → hsl 完整對照表（實作 fallback 時直接查用）

| Token | oklch 值 | hsl fallback |
|-------|---------|-------------|
| `--color-primary` | `oklch(50% 0.14 250)` | `hsl(220, 100%, 44%)` |
| `--color-primary-light` | `oklch(95% 0.02 250)` | `hsl(220, 40%, 95%)` |
| `--color-primary-dark` | `oklch(40% 0.16 250)` | `hsl(220, 100%, 35%)` |
| `--color-primary-hover` | `oklch(45% 0.16 250)` | `hsl(220, 100%, 40%)` |
| `--color-accent` | `oklch(65% 0.16 145)` | `hsl(145, 50%, 45%)` |
| `--color-accent-hover` | `oklch(55% 0.18 145)` | `hsl(145, 55%, 38%)` |
| `--color-success` | `oklch(55% 0.16 145)` | `hsl(145, 55%, 38%)` |
| `--color-warning` | `oklch(70% 0.15 80)` | `hsl(40, 80%, 55%)` |
| `--color-error` | `oklch(55% 0.20 25)` | `hsl(0, 70%, 45%)` |
| `--color-info` | `oklch(55% 0.12 250)` | `hsl(220, 60%, 50%)` |
| `--color-bg` | `#ffffff` | `#ffffff` |
| `--color-bg-alt` | `oklch(98% 0.005 80)` | `hsl(40, 20%, 97%)` |
| `--color-surface` | `#ffffff` | `#ffffff` |
| `--color-surface-hover` | `oklch(97% 0.003 265)` | `hsl(240, 10%, 96%)` |
| `--color-border` | `oklch(92% 0 0)` | `hsl(0, 0%, 90%)` |
| `--color-text` | `oklch(13% 0 0)` | `hsl(0, 0%, 13%)` |
| `--color-text-secondary` | `oklch(35% 0 0)` | `hsl(0, 0%, 35%)` |
| `--color-text-muted` | `oklch(50% 0 0)` | `hsl(0, 0%, 40%)` |
| `--color-text-placeholder` | `oklch(63% 0 0)` | `hsl(0, 0%, 58%)` |
| shadow/overlay | `oklch(0% 0 0 / alpha)` | `hsl(0 0% 0% / alpha)` |

#### Dark Theme — 市面主流深色風格

設計原則參照 GitHub Dark / Vercel Dark / Linear 等當代主流深色 UI：

- **深灰底色**：不用純黑 `#000`，使用深灰藍 `oklch(13~16%)` 降低視覺疲勞
- **Surface 分層**：透過 3~4 個明度層級區分背景/卡片/浮動元素（13% → 17% → 22% → 26%）
- **邊框可見度提高**：深色模式邊框比淺色更明顯（`oklch(28~32%)`），補償低對比環境
- **文字降白**：不用純白 `#fff`，主文字 `oklch(88%)`、次文字 `oklch(65%)`，減少刺眼
- **主色提亮**：Primary 色提亮至 `oklch(70%)` 以上，確保在深底上清晰可辨
- **陰影加深**：陰影透明度提升 3~4 倍，或改用微亮邊框代替陰影
- **保持同一色相**：Light/Dark 主色色相 (hue) 不變，僅調整明度和彩度

```css
/* ===== Dark Theme — 主流深色 ===== */
/* !! 同樣需要 hsl() fallback 先行 + @supports oklch 覆蓋 !! */
[data-theme="dark"] {
  /* hsl fallback: hsl(215, 100%, 67%) → oklch 增強如下 */
  --color-primary: oklch(70% 0.14 250);
  --color-primary-light: oklch(25% 0.04 250);
  --color-primary-dark: oklch(60% 0.16 250);
  --color-primary-hover: oklch(75% 0.12 250);

  --color-accent: oklch(70% 0.14 145);
  --color-accent-hover: oklch(75% 0.12 145);

  --color-success: oklch(65% 0.14 145);
  --color-warning: oklch(75% 0.14 80);
  --color-error: oklch(65% 0.16 25);
  --color-info: oklch(65% 0.10 250);

  /* 表面分層 — 由深至淺 */
  --color-bg: oklch(13% 0.01 260);              /* 最底層 */
  --color-bg-alt: oklch(15% 0.01 260);
  --color-surface: oklch(17% 0.01 260);         /* 卡片、區塊 */
  --color-surface-elevated: oklch(22% 0.01 260);/* 浮動面板、dropdown */
  --color-surface-hover: oklch(26% 0.01 260);

  /* 邊框 — 比淺色模式更明顯 */
  --color-border: oklch(28% 0.01 260);
  --color-border-subtle: oklch(24% 0.01 260);
  --color-divider: oklch(25% 0.01 260);

  /* 文字 — 降白減少刺眼 */
  --color-text: oklch(88% 0 0);
  --color-text-secondary: oklch(65% 0 0);
  --color-text-muted: oklch(56% 0 0);           /* 修正：48%→56% 確保 4.5:1 對比 (WCAG AA) */
  --color-text-placeholder: oklch(45% 0 0);     /* 修正：40%→45% 確保 3:1 對比 */

  /* 陰影 — 深色環境加深 */
  --shadow-xs: 0 1px 2px oklch(0% 0 0 / 0.2);
  --shadow-sm: 0 1px 3px oklch(0% 0 0 / 0.3), 0 1px 2px oklch(0% 0 0 / 0.2);
  --shadow-md: 0 4px 6px oklch(0% 0 0 / 0.3), 0 2px 4px oklch(0% 0 0 / 0.2);
  --shadow-lg: 0 10px 25px oklch(0% 0 0 / 0.4), 0 4px 10px oklch(0% 0 0 / 0.3);
  --shadow-xl: 0 20px 50px oklch(0% 0 0 / 0.5), 0 8px 20px oklch(0% 0 0 / 0.3);

  --overlay-bg: oklch(0% 0 0 / 0.65);
  --overlay-blur: blur(20px);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

#### Dark Theme oklch → hsl 完整對照表

| Token | oklch 值 | hsl fallback |
|-------|---------|-------------|
| `--color-primary` | `oklch(70% 0.14 250)` | `hsl(215, 100%, 67%)` |
| `--color-bg` | `oklch(13% 0.01 260)` | `hsl(220, 13%, 10%)` |
| `--color-bg-alt` | `oklch(15% 0.01 260)` | `hsl(220, 13%, 13%)` |
| `--color-surface` | `oklch(17% 0.01 260)` | `hsl(220, 13%, 15%)` |
| `--color-surface-elevated` | `oklch(22% 0.01 260)` | `hsl(220, 10%, 20%)` |
| `--color-surface-hover` | `oklch(26% 0.01 260)` | `hsl(220, 10%, 24%)` |
| `--color-border` | `oklch(28% 0.01 260)` | `hsl(220, 10%, 26%)` |
| `--color-text` | `oklch(88% 0 0)` | `hsl(0, 0%, 87%)` |
| `--color-text-secondary` | `oklch(65% 0 0)` | `hsl(0, 0%, 60%)` |
| `--color-text-muted` | `oklch(56% 0 0)` | `hsl(0, 0%, 50%)` |
| `--color-text-placeholder` | `oklch(45% 0 0)` | `hsl(0, 0%, 40%)` |
| shadow/overlay | `oklch(0% 0 0 / alpha)` | `hsl(0 0% 0% / alpha)` |

**主題切換實作規則：**

- `<html>` 標籤上設置 `data-theme` 屬性，所有樣式透過 CSS Custom Properties 連動
- 首次載入：檢查 `localStorage.getItem('theme')`，若無則偵測 `prefers-color-scheme`
- 切換時不重新載入頁面，僅修改 `data-theme` 屬性值
- 所有元件的顏色、陰影、邊框一律使用 `var(--color-*)` / `var(--shadow-*)`，**禁止寫死色碼**
- 切換按鈕使用 `sun.svg` / `moon.svg` 向量圖示，搭配 CSS transition 過渡動畫
- 主題切換時對 `<html>` 加上 `transition: background-color 300ms, color 300ms`
- **Primary blue hover 禁止變淺**：`--color-primary` (#0071e3 等) 對比剛好通過 4.5:1，hover 若再變淺會跌破門檻。Hover 效果改用底線 (`text-decoration`)、背景色變化 (`background`)、或 `box-shadow` 輔助，不可降低文字色彩明度

**Light 與 Dark 的設計差異對照：**

| 面向 | Light (Apple 白) | Dark (主流深色) |
|------|------------------|----------------|
| 背景 | 純白 `#fff` + 淡灰 `#f5f5f7` 交替 | 深灰藍 `oklch(13%)` 分層遞增 |
| 邊框 | 極淡幾乎不可見，靠陰影分層 | 明度提高，邊框更明顯 |
| 陰影 | 多層柔和低透明度 | 透明度加深 3~4 倍 |
| 文字 | 接近純黑 `oklch(13%)` | 降白 `oklch(88%)`，不用純白 |
| 主色 | 飽和、中等明度 | 提亮、微降彩度 |
| 整體 | 留白充足、呼吸感、精緻 | 沉穩、層次分明、護眼 |

### 字型系統

```css
:root {
  --font-heading: "Noto Sans TC", "微軟正黑體", sans-serif;
  --font-body: "Noto Sans TC", "微軟正黑體", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* 字級比例 (Major Third 1.25) */
  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.8rem);
  --text-sm: clamp(0.8rem, 0.75rem + 0.3vw, 0.9rem);
  --text-base: clamp(0.95rem, 0.9rem + 0.3vw, 1.05rem);
  --text-lg: clamp(1.1rem, 1rem + 0.4vw, 1.25rem);
  --text-xl: clamp(1.3rem, 1.15rem + 0.6vw, 1.55rem);
  --text-2xl: clamp(1.6rem, 1.4rem + 0.8vw, 2rem);
  --text-3xl: clamp(2rem, 1.7rem + 1.2vw, 2.5rem);
}
```

### 間距系統

```css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
}
```

### 斷點

```css
/* 行動優先 */
/* 預設: 手機 (<768px) */
@media (min-width: 768px)  { /* 平板 */ }
@media (min-width: 1024px) { /* 桌面 */ }
@media (min-width: 1280px) { /* 大螢幕 */ }
```

### 動畫規範

- 過渡時間：快速互動 150ms / 一般過渡 300ms / 頁面切換 500ms
- 緩動函數：使用 `cubic-bezier(0.25, 0.1, 0.25, 1)` 或 CSS `ease-out`
- 所有動畫必須有 `prefers-reduced-motion: reduce` 降級
- 滾動動畫使用 Intersection Observer 或 CSS scroll-driven animations

---

## 多語系規範 (i18n)

### 支援語系（共 6 種）

| 代碼 | 語言 | 原文名稱 | `lang` 屬性 |
|------|------|----------|-------------|
| `zh-TW` | 繁體中文 | 繁體中文 | `zh-Hant` |
| `zh-CN` | 简体中文 | 简体中文 | `zh-Hans` |
| `en` | English | English | `en` |
| `vi` | 越南語 | Tiếng Việt | `vi` |
| `th` | 泰語 | ภาษาไทย | `th` |
| `id` | 印尼語 | Bahasa Indonesia | `id` |

### i18n 實作規則

- 翻譯檔案以 JSON 格式存放於 `i18n/` 目錄，每語系一個檔案（`zh-TW.json`, `vi.json` ...）
- HTML 中的可翻譯文字使用 `data-i18n="key"` 屬性標記
- 切換語系時透過 JS 動態替換所有 `[data-i18n]` 元素的 `textContent`
- 同步更新 `<html lang="">` 屬性
- 使用者選擇的語系存入 `localStorage.getItem('lang')`
- URL 使用 `?lang=vi` 參數，優先權：URL 參數 > localStorage > 瀏覽器語言 > 預設 zh-TW
- 語系切換器在行動裝置上使用 `<select>` 下拉取代按鈕排列，節省空間
- 泰語需載入 `Noto Sans Thai`、越南語/印尼語使用預設 Latin 字型

### i18n 檔案結構

```
i18n/
├── zh-TW.json    # 繁體中文（主檔，所有 key 必須在此定義）
├── zh-CN.json    # 简体中文
├── en.json       # English
├── vi.json       # Tiếng Việt
├── th.json       # ภาษาไทย
└── id.json       # Bahasa Indonesia
```

### 翻譯 Key 完整對照表（153 keys）

六語 JSON 檔案已建立於 `i18n/`，每檔 153 個 key 完全同步（由 `scripts/i18n-sync.mjs` 驗證）。

**Key 命名規則：**
- flat dot-notation：`"prefix.name"` 或 `"prefix.sub.name"`
- 前綴分類：`site.*` / `header.*` / `topbar.*` / `search.*` / `nav.*` / `banner.*` / `quicklink.*` / `social.*` / `section.*` / `tab.*` / `more.*` / `video.*` / `honor.*` / `dept.*` / `footer.*` / `theme.*` / `modal.*` / `fab.*` / `widget.*` / `seasonal.*` / `aria.*` / `weekday.*` / `month.*` / `holiday.*`
- zh-TW.json 為 single source of truth，新增 key 必須先加在此

**Key 分類摘要：**

| 前綴 | 數量 | 涵蓋範圍 |
|------|------|----------|
| `_meta.*` | 3 | 語系元資料（lang / dir / name）|
| `site.*` | 3 | 頁面標題、description、keywords |
| `header.*` | 4 | 系所名稱、英文名、校名、院名 |
| `topbar.*` | 3 | 回首頁、聯絡我們、網站導覽 |
| `search.*` | 2 | placeholder、按鈕 |
| `nav.*` | 34 | 12 主選單 + 22 子選單全部項目 |
| `banner.*` | 6 | 3 張輪播的標題 + 說明 |
| `quicklink.*` | 4 | 4 宮格入口名稱 |
| `social.*` | 1 | 「追蹤我們」|
| `section.*` | 5 | 影音/最新消息/榮譽榜/管理學院 各區塊標題 |
| `tab.*` / `more.*` | 6 | 3 分頁標籤 + 3 更多連結 |
| `video.*` | 2 | 影片卡片標題 |
| `honor.*` | 1 | 展開更多 |
| `dept.*` | 6 | 6 院系名稱 |
| `footer.*` | 9 | 系所名/地址/電話/傳真/Email/連結標題/版權 |
| `theme.*` | 3 | 淺色/深色/切換 |
| `modal.*` | 3 | 標題/關閉/不再顯示 |
| `fab.*` | 6 | 開啟/關閉/LINE/FB/電話/Email |
| `backToTop` | 1 | 回到頂部 |
| `widget.*` | 8 | 面板/日曆/時鐘/天氣/假日/無資料/天後/今天 |
| `seasonal.*` | 3 | 開關標籤 |
| `aria.*` | 11 | 所有 ARIA label（選單/搜尋/輪播/語系/跳過導覽 等）|
| `weekday.*` | 7 | 日~六 |
| `month.*` | 12 | 一月~十二月 |
| `holiday.*` | 10 | 台灣國定假日名稱 |
| **合計** | **153** | |

**HTML 中的 data-i18n 使用方式：**

```html
<!-- 純文字元素：直接替換 textContent -->
<h2 data-i18n="section.news">最新消息</h2>

<!-- 含子元素（圖示+文字）：文字包在 <span> 中 -->
<a href="index.html">
  <svg><!-- nav-home.svg --></svg>
  <span data-i18n="nav.home">回首頁</span>
</a>

<!-- placeholder 屬性 -->
<input data-i18n-placeholder="search.placeholder" placeholder="關鍵字搜尋">

<!-- aria-label 屬性 -->
<button data-i18n-aria="aria.backToTop" aria-label="回到頂部">...</button>

<!-- title 屬性（如有需要） -->
<a data-i18n-title="aria.externalLink" title="另開新視窗">...</a>
```

**i18n.js 替換邏輯：**

```javascript
function applyTranslations(translations) {
  // textContent 替換
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) el.textContent = translations[key];
  });
  // placeholder 替換
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) el.placeholder = translations[key];
  });
  // aria-label 替換
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (translations[key]) el.setAttribute('aria-label', translations[key]);
  });
  // title 替換
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (translations[key]) el.title = translations[key];
  });
  // <html lang=""> 更新
  document.documentElement.lang = translations['_meta.lang'] || 'zh-Hant';
  // <title> 更新
  document.title = translations['site.title'] || document.title;
}
```

### 字型對應

```css
:root {
  --font-heading: "Noto Sans TC", sans-serif;
  --font-body: "Noto Sans TC", sans-serif;
}
[lang="th"] {
  --font-heading: "Noto Sans Thai", "Noto Sans TC", sans-serif;
  --font-body: "Noto Sans Thai", "Noto Sans TC", sans-serif;
}
```

---

## 彈跳視窗提醒規範 (Modal Notification)

### 行為規則

| 規則 | 說明 |
|------|------|
| 觸發時機 | 首次進站、或有 `data-modal-active` 標記的公告時自動彈出 |
| 關閉方式 | 關閉按鈕 (X) / 點擊遮罩層 / 按 ESC 鍵 — 三種皆需支援 |
| 不再顯示 | 以公告內容 hash 為 key 存入 `localStorage`（`modal-dismiss-{contentHash}`），內容不變時不重複彈出，內容變更時自動再顯示 |
| 焦點鎖定 | 開啟時 `focus trap` 限制 Tab 焦點在彈窗內循環，關閉後歸還觸發元素焦點 |
| 背景鎖定 | 開啟時 `document.documentElement.style.overflow = 'hidden'`，關閉後恢復 |
| 多則公告 | 彈窗內部可左右切換多則公告，含圓點指示器 |
| z-index | 遮罩層 `z-index: var(--z-modal-overlay)`、彈窗本體 `z-index: var(--z-modal)` |
| 動畫 | 遮罩 fade-in 300ms + 彈窗 scale(0.9→1) + opacity(0→1) 300ms |

### HTML 結構

```html
<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal__container">
    <button class="modal__close" aria-label="關閉" data-i18n-aria="modal.close">×</button>
    <h2 class="modal__title" id="modal-title" data-i18n="modal.title">重要公告</h2>
    <div class="modal__body"><!-- 公告內容 --></div>
    <div class="modal__footer">
      <label class="modal__dismiss">
        <input type="checkbox" id="modal-no-show">
        <span data-i18n="modal.dontShowToday">今日不再顯示</span>
      </label>
    </div>
    <div class="modal__dots"><!-- 多則指示器 --></div>
  </div>
</div>
```

---

## 浮球按鈕規範 (Floating Action Button)

### 行為規則

| 規則 | 說明 |
|------|------|
| 位置 | `position: fixed; bottom: 24px; right: 24px;` 固定於視窗右下角 |
| 主按鈕尺寸 | 桌面 56px / 手機 48px（最低觸控標準） |
| 子按鈕尺寸 | 桌面 44px / 手機 40px |
| 展開方向 | 向上展開，子項目間距 12px，依序延遲 50ms 動畫 |
| 展開動畫 | 子項 `transform: scale(0) → scale(1)` + `opacity: 0 → 1`，主按鈕旋轉 45° |
| 收合觸發 | 點擊子項目 / 點擊頁面其他區域 / 按 ESC 鍵 |
| z-index | 主按鈕 `z-index: var(--z-fab)`（低於 Modal，高於一般內容） |
| 與回到頂部分離 | 回到頂部保持獨立按鈕（N-5），不納入 FAB。FAB 專注社群/聯繫快捷 |

### 預設子項目

| 順序 | 項目 | SVG 圖示 | 連結 |
|------|------|----------|------|
| 1 | LINE | `brand-line.svg` | line.me 連結 |
| 2 | Facebook | `brand-facebook.svg` | FB 粉專連結 |
| 3 | 電話聯繫 | `phone.svg` | tel:(04)23323000 |
| 4 | Email | `mail.svg` | mailto:leisure@cyut.edu.tw |

### HTML 結構

```html
<div class="fab" aria-label="快速操作選單">
  <button class="fab__trigger" aria-expanded="false" aria-label="開啟快速選單">
    <!-- 使用 inline SVG，不用 Font Awesome -->
    <svg class="fab__icon fab__icon--open" ...><!-- plus.svg --></svg>
    <svg class="fab__icon fab__icon--close" ...><!-- close.svg --></svg>
  </button>
  <div class="fab__menu">
    <a class="fab__item" href="..." aria-label="LINE">
      <span class="fab__item-icon"><!-- brand-line.svg inline --></span>
      <span class="fab__item-label">LINE</span>
    </a>
    <!-- ... 其餘子項 -->
  </div>
</div>
```

---

## 版號系統 (Versioning)

### 版號格式

```
MAJOR.MINOR.PATCH
```

| 欄位 | 遞增時機 | 範例 |
|------|----------|------|
| MAJOR | 大改版（視覺大翻修 / 架構重寫） | 1.0.0 → 2.0.0 |
| MINOR | 新功能上線（新 Widget / 新語系 / 新季節特效） | 1.0.0 → 1.1.0 |
| PATCH | Bug 修正 / 文字更新 / 樣式微調 | 1.0.0 → 1.0.1 |

### 版號來源：`version.json`

所有版號資訊集中在單一檔案，Build script 和 HTML 均從此讀取：

```json
{
  "version": "1.0.0",
  "buildDate": "2026-04-14T10:00:00+08:00",
  "buildHash": "a3f8c2d"
}
```

### 版號注入位置

| 位置 | 格式 | 用途 |
|------|------|------|
| `<meta name="version" content="1.0.0">` | HTML head | SEO / 識別 |
| `<meta name="build-hash" content="a3f8c2d">` | HTML head | 快取驗證 |
| CSS/JS URL 後綴 `?v=1.0.0` | 資源引用 | 快取破壞 (cache busting) |
| 頁尾 `v1.0.0` 文字 | 可見 UI | 使用者可見版號 |
| `window.__APP_VERSION__` | JS 全域 | 程式內取用 |
| Console 啟動訊息 | DevTools | 開發者除錯用 |

### Build Script（`scripts/build.sh`）

一鍵完成：版號遞增 → 寫入 version.json → 注入 HTML → 快取破壞 → 合併壓縮：

```bash
#!/bin/bash
# 用法：
#   ./scripts/build.sh patch     # 1.0.0 → 1.0.1
#   ./scripts/build.sh minor     # 1.0.0 → 1.1.0
#   ./scripts/build.sh major     # 1.0.0 → 2.0.0
#   ./scripts/build.sh           # 不遞增，僅重新 build
```

### 版號腳本實作邏輯

```javascript
// scripts/version.mjs — Node.js 腳本
import { readFileSync, writeFileSync } from 'fs';

const file = 'version.json';
const data = JSON.parse(readFileSync(file, 'utf-8'));
const [major, minor, patch] = data.version.split('.').map(Number);
const type = process.argv[2]; // major | minor | patch

if (type === 'major') data.version = `${major + 1}.0.0`;
else if (type === 'minor') data.version = `${major}.${minor + 1}.0`;
else if (type === 'patch') data.version = `${major}.${minor}.${patch + 1}`;

data.buildDate = new Date().toISOString();
data.buildHash = Math.random().toString(36).slice(2, 9);
writeFileSync(file, JSON.stringify(data, null, 2));

console.log(`Version: ${data.version} | Hash: ${data.buildHash}`);
```

### HTML 中的版號引用模板

```html
<head>
  <meta name="version" content="{{VERSION}}">
  <meta name="build-hash" content="{{BUILD_HASH}}">
  <link rel="stylesheet" href="dist/style.css?v={{VERSION}}">
</head>
<body>
  <script>window.__APP_VERSION__ = '{{VERSION}}';</script>
  <script type="module" src="js/main.js?v={{VERSION}}"></script>
</body>
```

Build script 用 `sed` 替換 `{{VERSION}}` / `{{BUILD_HASH}}` 佔位符。

---

## 效能與加載速度設計（參照巴哈姆特架構）

### 設計原則

參照巴哈姆特 (gamer.com.tw) 的高效能加載策略：
- **多域名資源分發**：靜態資源分散到不同子域（巴哈用 i2/p2 子域），突破瀏覽器同域並行限制
- **內容定址 URL**：資源 URL 含 hash/版號（巴哈圖片用 hash 路徑），實現永久快取
- **佔位圖先行**：巴哈用 `none.gif` 佔位 → 真實圖片懶載入，避免 CLS
- **首屏內容行內化**：導覽列直接在 HTML 中渲染，不等 JS 載入
- **JSON-LD 結構化資料**：巴哈注入 Website / Organization schema，提升搜尋引擎理解

### Lighthouse 分數目標

| 類別 | 目標 |
|------|------|
| Performance | ≥ 90 |
| Accessibility | = 100 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |

### Core Web Vitals 目標

| 指標 | 目標 | 關鍵策略 |
|------|------|----------|
| FCP | < 1.2s | Critical CSS 內聯 + preconnect + 系統字型 fallback |
| LCP | < 2.0s | Banner `fetchpriority="high"` + 佔位圖預留空間 |
| CLS | < 0.05 | 所有媒體設 width/height + `aspect-ratio` + skeleton placeholder |
| TBT | < 150ms | 非首屏 JS 全部動態 import() + Canvas 30fps + 行動關閉特效 |
| TTI | < 3.0s | modulepreload 消除 waterfall + 最小首屏 JS |
| TTFB | < 400ms | 靜態檔案 + CDN / GitHub Pages 部署 |

### `<head>` 資源載入順序（Critical Rendering Path）

順序極為重要，每一行的位置都經過效能考量：

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 1. 版號 meta（最早，供 SW 與 JS 讀取） -->
  <meta name="version" content="{{VERSION}}">
  <meta name="build-hash" content="{{BUILD_HASH}}">

  <!-- 2. SEO meta（搜尋引擎優先解析） -->
  <title>休閒事業管理系 - 朝陽科技大學</title>
  <meta name="description" content="...">
  <link rel="canonical" href="{{BASE_URL}}/">

  <!-- 3. 主題色防閃爍腳本（必須在 CSS 之前，阻塞但極小） -->
  <script>
    (function(){
      try {
        var t = localStorage.getItem('theme')
          || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
      } catch(e) { var t = 'light'; }
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>

  <!-- 4. Preconnect（越早越好，建立 TCP/TLS 連線） -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- 5. Critical CSS 內聯（首屏渲染所需的最小樣式） -->
  <style>/* base variables + nav + banner + skeleton 的 critical 子集 */</style>

  <!-- 6. 完整 CSS 非同步載入（不阻塞首次渲染） -->
  <link rel="preload" href="dist/style.css?v={{VERSION}}" as="style"
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="dist/style.css?v={{VERSION}}"></noscript>

  <!-- 7. Google Fonts（display=swap，不阻塞文字渲染） -->
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap"
        rel="stylesheet">

  <!-- 8. LCP 圖片預載入 -->
  <link rel="preload" href="assets/images/original/banner.webp" as="image"
        type="image/webp" fetchpriority="high">

  <!-- 9. JS modulepreload（首屏關鍵模組，消除 import waterfall） -->
  <link rel="modulepreload" href="js/modules/navigation.js?v={{VERSION}}">
  <link rel="modulepreload" href="js/modules/banner.js?v={{VERSION}}">
  <link rel="modulepreload" href="js/modules/tabs.js?v={{VERSION}}">
  <link rel="modulepreload" href="js/modules/theme.js?v={{VERSION}}">

  <!-- 10. DNS prefetch（外部連結預解析） -->
  <link rel="dns-prefetch" href="https://auth2.cyut.edu.tw">
  <link rel="dns-prefetch" href="https://cyutis.cyut.edu.tw">

  <!-- 11. Favicon -->
  <link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml">

  <!-- 12. Structured Data（SEO） -->
  <script type="application/ld+json">/* ... */</script>
</head>
<body>
  <!-- 13. 版號全域變數 -->
  <script>window.__APP_VERSION__='{{VERSION}}';</script>

  <!-- 14. 主程式入口（type=module 自動 defer） -->
  <script type="module" src="js/main.js?v={{VERSION}}"></script>
</body>
```

### 字型載入策略

```css
--font-body: "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif;
```

- 系統字型優先 fallback（Windows 微軟正黑 / macOS 蘋方），Noto Sans TC 作為增強
- Google Fonts 自動 unicode-range 子集化，僅下載頁面用到的字元切片
- **僅載入 400 + 700 兩個字重**
- `font-display: swap` 避免 FOIT
- 泰語字型（Noto Sans Thai ~92KB/weight）僅在 `lang="th"` 時動態注入 `<link>`

### 圖片策略

| 位置 | loading | fetchpriority | 佔位策略 |
|------|---------|---------------|----------|
| Banner 輪播（LCP）| `eager` | `high` | `<link rel="preload">` 在 head 中 |
| 快速連結 4 宮格 | `eager` | — | `width` + `height` + `aspect-ratio` |
| 影音區以下所有圖片 | `lazy` | — | skeleton placeholder div（背景色 `var(--color-bg-alt)`）|

所有圖片提供 WebP + PNG fallback：

```html
<picture>
  <source srcset="assets/images/original/banner.webp" type="image/webp">
  <img src="assets/images/original/banner.png" width="1000" height="340"
       alt="休閒系形象橫幅" loading="eager" fetchpriority="high">
</picture>
```

### 快取策略

| 資源類型 | URL 格式 | Cache-Control | 更新機制 |
|----------|----------|---------------|----------|
| HTML | `/index.html` | `no-cache`（每次驗證 ETag） | 內容即時生效 |
| CSS | `dist/style.css?v=1.0.0` | `max-age=31536000, immutable` | 版號變更 = 新 URL = 自動破壞快取 |
| JS 模組 | `js/main.js?v=1.0.0` | `max-age=31536000, immutable` | 同上 |
| 圖片 | `assets/images/*.webp?v=1.0.0` | `max-age=31536000, immutable` | 同上 |
| SVG 圖示 | inline | 隨 HTML 快取 | 內聯在 HTML 中 |
| i18n JSON | `i18n/zh-TW.json?v=1.0.0` | `max-age=86400` | 版號破壞 + 1 天 TTL |
| Google Fonts | Google CDN 自管 | Google 控制 | 自動 |

### Service Worker（可選漸進增強）

```javascript
// sw.js — 快取優先策略
const CACHE_NAME = 'cyut-leisure-v{{VERSION}}';
const PRECACHE = [
  '/index.html',
  '/dist/style.css?v={{VERSION}}',
  '/js/main.js?v={{VERSION}}',
  // ... 關鍵資源
];
```

- 版號寫入 `CACHE_NAME`，版號變更時 `activate` 事件自動清除舊快取：

```javascript
// sw.js — activate 事件：清除非當前版號的舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith('cyut-leisure-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});
```

- `install` 事件中呼叫 `self.skipWaiting()` 讓新 SW 立即接管
- 僅快取靜態資源，API / 動態內容走 network-first
- 離線時顯示 fallback 頁面

### Production Build Script 完整版（`scripts/build.sh`）

```bash
#!/bin/bash
set -e

# 1. 版號遞增
node scripts/version.mjs "$1"
VERSION=$(node -p "require('./version.json').version")
HASH=$(node -p "require('./version.json').buildHash")
echo "Building v${VERSION} (${HASH})..."

# 2. 清理 dist/
rm -rf dist && mkdir -p dist

# 3. CSS 合併 + 壓縮
cat css/base.css css/layout.css css/components.css css/utilities.css > dist/style.css

# 4. PNG → WebP
for f in assets/images/original/*.png; do
  cwebp -q 80 "$f" -o "assets/images/original/$(basename "${f%.png}").webp" 2>/dev/null || true
done

# 5. SVG 壓縮
npx svgo -f assets/icons/svg/ -o dist/icons/ --quiet 2>/dev/null || true

# 6. 注入版號到 HTML（使用 | 分隔符避免路徑中 / 衝突）
sed -e "s|{{VERSION}}|${VERSION}|g" \
    -e "s|{{BUILD_HASH}}|${HASH}|g" \
    index.html > dist/index.html

# 7. 注入版號到 Service Worker
sed -e "s|{{VERSION}}|${VERSION}|g" sw.js > dist/sw.js 2>/dev/null || true

echo "Build complete: v${VERSION}"
```

---

## 頁面區塊架構（Section Boundary Design）

### 設計原則

每個頁面區塊有**清晰的結構邊界**，遵循以下規則：
- 每個區塊是獨立的 `<section>` 或語義標籤，含唯一 `id`
- CSS 使用 `content-visibility: auto` 讓瀏覽器跳過首屏外區塊的渲染
- 每個區塊有 `data-section` 屬性標記，供 JS 模組化載入和 Analytics 追蹤
- 區塊之間的間距統一由 layout CSS 的 `.section` 類別控制
- 骨架屏 (skeleton) 預留在 HTML 中，JS 載入後替換

### 首頁區塊地圖

```
┌─────────────────────────────────────────────┐
│ #skip-link          跳至主要內容連結 (SR-only)│
├─────────────────────────────────────────────┤
│ #site-header        HEADER                  │
│  ├ logo + 校名 + 搜尋 + 語系 + 主題切換     │
├─────────────────────────────────────────────┤
│ #main-nav           NAV                     │
│  ├ 12 主選單 + dropdown                     │
├─────────────────────────────────────────────┤
│ #hero-banner        SECTION [data-section]  │  ← LCP 元素
│  ├ 輪播圖片/文字                             │     fetchpriority="high"
├─────────────────────────────────────────────┤
│                     <main id="main-content"> │
│ ┌─────────────────────────────────────────┐ │
│ │ #quick-links      SECTION [data-section]│ │  ← 首屏
│ │  ├ 4 宮格（學生系統/教職員/TronClass/教室）│ │
│ ├─────────────────────────────────────────┤ │
│ │ #social-bar       SECTION [data-section]│ │  ← 首屏
│ │  ├ 5 社群媒體圖示                        │ │
│ ├─────────────────────────────────────────┤ │
│ │ #video-section    SECTION [data-section]│ │  ← content-visibility: auto
│ │  ├ 2 影片卡片                            │ │     (首屏外，延遲渲染)
│ ├─────────────────────────────────────────┤ │
│ │ #announcements    SECTION [data-section]│ │  ← content-visibility: auto
│ │  ├ 3-tab 公告（AJAX 懶載入）             │ │     Tab 內容按需載入
│ ├─────────────────────────────────────────┤ │
│ │ #honor-roll       SECTION [data-section]│ │  ← content-visibility: auto
│ │  ├ 榮譽榜列表                            │ │
│ ├─────────────────────────────────────────┤ │
│ │ #college-depts    SECTION [data-section]│ │  ← content-visibility: auto
│ │  ├ 6 院系卡片連結                        │ │
│ └─────────────────────────────────────────┘ │
│                     </main>                  │
├─────────────────────────────────────────────┤
│ #site-footer        FOOTER                  │
│  ├ 聯絡 + 快速連結 + 相關連結 + 版號        │
├─────────────────────────────────────────────┤
│ #seasonal-canvas    CANVAS (fixed overlay)  │  ← pointer-events: none
│ #back-to-top        BUTTON (fixed)          │  ← 獨立
│ #fab                DIV (fixed)             │  ← 社群/聯繫
│ #modal-overlay      DIV (fixed, hidden)     │  ← 初始隱藏
│ #widget-panel       ASIDE (fixed)           │  ← 側邊欄
└─────────────────────────────────────────────┘
```

### 區塊 HTML 結構規範

每個區塊遵循統一格式：

```html
<section id="announcements"
         class="section"
         data-section="announcements"
         aria-labelledby="announcements-title"
         style="content-visibility: auto; contain-intrinsic-size: auto 500px;">
  <!-- contain-intrinsic-size 需依各區塊實際高度個別設定：
       #video-section:  auto 380px
       #announcements:  auto 600px
       #honor-roll:     auto 500px
       #college-depts:  auto 300px
  -->

  <div class="section__inner">
    <h2 id="announcements-title" class="section__title" data-i18n="section.announcements">
      最新消息
    </h2>
    <div class="section__body">
      <!-- 骨架屏，JS 載入後替換 -->
      <div class="skeleton skeleton--tabs" aria-hidden="true"></div>
    </div>
  </div>
</section>
```

| 屬性 | 用途 |
|------|------|
| `id` | 錨點導覽 + JS 選取 |
| `class="section"` | 統一間距與邊界樣式 |
| `data-section` | Analytics 追蹤 + 模組掛載點 |
| `aria-labelledby` | 無障礙標題關聯 |
| `content-visibility: auto` | 首屏外區塊延遲渲染，大幅加速 FCP |
| `contain-intrinsic-size` | 預估高度，避免捲動跳動 |

### 骨架屏 (Skeleton Loading)

首屏外的每個區塊在 HTML 中包含骨架屏佔位，JS 載入資料後替換：

```css
/* GPU 合成動畫（使用 transform 而非 background-position，零主執行緒開銷） */
.skeleton {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-alt);
  border-radius: var(--radius-sm);
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--color-surface), transparent);
  transform: translateX(-100%);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  to { transform: translateX(100%); }
}
```

---

## SEO 與 AI 搜尋架構

### 設計目標

同時為**傳統搜尋引擎爬蟲**（Google / Bing）和**未來 AI 搜尋**（ChatGPT Search / Perplexity / Google AI Overview）最佳化。

### HTML `<head>` Meta 完整規範

```html
<!-- 基礎 SEO -->
<title>休閒事業管理系 - 朝陽科技大學 | Department of Leisure Service Management</title>
<meta name="description" content="朝陽科技大學管理學院休閒事業管理系，培養休閒產業管理專業人才，提供碩士班、大學部日間與進修課程。">
<meta name="keywords" content="朝陽科技大學,休閒事業管理系,休閒管理,觀光,餐旅,碩士班,大學部">
<meta name="author" content="朝陽科技大學 休閒事業管理系">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{{BASE_URL}}/">

<!-- 多語系替代頁面 -->
<link rel="alternate" hreflang="zh-Hant" href="?lang=zh-TW">
<link rel="alternate" hreflang="zh-Hans" href="?lang=zh-CN">
<link rel="alternate" hreflang="en" href="?lang=en">
<link rel="alternate" hreflang="vi" href="?lang=vi">
<link rel="alternate" hreflang="th" href="?lang=th">
<link rel="alternate" hreflang="id" href="?lang=id">
<link rel="alternate" hreflang="x-default" href="?lang=zh-TW">

<!-- Open Graph (Facebook / LINE / Social) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="朝陽科技大學 休閒事業管理系">
<meta property="og:title" content="休閒事業管理系 - 朝陽科技大學">
<meta property="og:description" content="培養具備休閒產業管理專業知能之人才">
<meta property="og:image" content="{{BASE_URL}}/assets/images/og-cover.jpg">
<meta property="og:url" content="{{BASE_URL}}/">
<meta property="og:locale" content="zh_TW">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="休閒事業管理系 - 朝陽科技大學">
<meta name="twitter:description" content="培養具備休閒產業管理專業知能之人才">
<meta name="twitter:image" content="{{BASE_URL}}/assets/images/og-cover.jpg">

<!-- 版號 -->
<meta name="version" content="{{VERSION}}">
```

### JSON-LD 結構化資料（參照巴哈姆特模式）

巴哈姆特使用 `WebSite` + `Organization` schema。我們擴充為完整的教育機構結構：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "朝陽科技大學 休閒事業管理系",
      "alternateName": "CYUT Department of Leisure Service Management",
      "url": "{{BASE_URL}}/",
      "inLanguage": ["zh-Hant", "zh-Hans", "en", "vi", "th", "id"]
      /* SearchAction 已移除：靜態網站無 /search 端點，避免 Google Search Console 報錯 */
    },
    {
      "@type": "EducationalOrganization",
      "name": "朝陽科技大學 休閒事業管理系",
      "alternateName": "Department of Leisure Service Management, CYUT",
      "url": "{{BASE_URL}}/",
      "logo": "{{BASE_URL}}/assets/images/logo.png",
      "parentOrganization": {
        "@type": "CollegeOrUniversity",
        "name": "朝陽科技大學",
        "alternateName": "Chaoyang University of Technology",
        "url": "https://www.cyut.edu.tw/"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "吉峰東路168號 T2-619.1室",
        "addressLocality": "霧峰區",
        "addressRegion": "台中市",
        "postalCode": "413310",
        "addressCountry": "TW"
      },
      "telephone": "+886-4-23323000",
      "email": "leisure@cyut.edu.tw",
      "sameAs": [
        "https://www.facebook.com/people/朝陽科技大學-休閒事業管理系/61553103520452/",
        "https://www.instagram.com/dlsm_cyut/",
        "https://www.threads.com/@dlsm_cyut",
        "https://www.tiktok.com/@dlsm_cyut",
        "https://line.me/R/ti/p/@446pcgwv"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "朝陽科技大學", "item": "https://www.cyut.edu.tw/" },
        { "@type": "ListItem", "position": 2, "name": "管理學院", "item": "https://www.cyut.edu.tw/college/management" },
        { "@type": "ListItem", "position": 3, "name": "休閒事業管理系", "item": "{{BASE_URL}}/" }
      ]
    }
  ]
}
</script>
```

### AI 搜尋最佳化

未來 AI 搜尋引擎（如 ChatGPT Search、Google AI Overview）需要**結構清晰且語義明確**的 HTML：

| 策略 | 實作 |
|------|------|
| 語義化標籤 | `<main>`, `<article>`, `<section>`, `<nav>`, `<aside>` 嚴格使用 |
| 標題層級 | 單一 `<h1>` + 各區塊 `<h2>` + 內容 `<h3>`，不跳級 |
| `aria-label` 區塊命名 | 每個 `<section>` 和 `<nav>` 有描述性 label |
| 純文字可見 | 核心資訊不藏在 JS 渲染後的動態內容中；首屏 HTML 即含關鍵文字 |
| 結構化 FAQ | 常見問題頁使用 `FAQPage` schema |
| 麵包屑 | `BreadcrumbList` schema + 可見 UI 麵包屑 |
| `<time datetime="">` | 所有日期用 `<time>` 標籤包裹，AI 可精確解讀時間 |
| `lang` 屬性 | `<html lang="zh-Hant">` 隨語系切換動態更新 |
| `sitemap.xml` | 列出所有頁面 URL + lastmod + changefreq + priority |
| `robots.txt` | 允許所有爬蟲 + 指向 sitemap |

### Sitemap 與 Robots

```
朝陽/
├── sitemap.xml      # 所有頁面清單
├── robots.txt       # 爬蟲指引
└── ...
```

```xml
<!-- sitemap.xml 格式 -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{{BASE_URL}}/</loc>
    <lastmod>2026-04-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... 各子頁面 -->
</urlset>
```

```
# robots.txt
User-agent: *
Allow: /

Disallow: /scripts/
Disallow: /dist/
Disallow: /docs/
Disallow: /node_modules/
Disallow: /version.json
Disallow: /CLAUDE.md

Sitemap: {{BASE_URL}}/sitemap.xml
```

---

## Z-Index 分層系統

使用 CSS Custom Properties 定義全站 z-index 層級，禁止使用裸數字：

```css
:root {
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky-nav: 200;
  --z-tooltip: 300;
  --z-toast: 400;
  --z-back-to-top: 500;
  --z-fab: 600;
  --z-seasonal-canvas: 50;       /* 低於 nav，不攔截指標事件 */
  --z-widget-panel: 150;         /* 高於 dropdown，低於 sticky-nav */
  --z-modal-overlay: 700;
  --z-modal: 701;
}
```

所有元件的 `z-index` 一律引用變數，禁止寫裸數字。季節 Canvas 設 `pointer-events: none` + 低 z-index。

---

## 季節特效系統 (Seasonal Effects)

### 架構概述

在頁面插入一個全屏 `<canvas>` 畫布層，根據當前季節（或手動觸發）渲染粒子動畫。
以**外掛式模組**設計，核心引擎不耦合任何季節內容，新季節只需新增一個配置物件。

### 行為規則

| 規則 | 說明 |
|------|------|
| 畫布位置 | `position: fixed; inset: 0; z-index: var(--z-seasonal-canvas); pointer-events: none;` |
| 季節判定 | 依系統日期自動判定：春(3-5月) / 夏(6-8月) / 秋(9-11月) / 冬(12-2月) |
| 手動切換 | 提供 API `SeasonalEffects.setSeason('spring')` 供開發者或管理後台覆蓋 |
| prefers-reduced-motion | `reduce` 時完全停用，不初始化 Canvas |
| 行動裝置 | `max-width: 768px` 預設關閉，可透過設定開啟 |
| 效能保護 | 最大粒子數 30；throttle 至 30fps（`requestAnimationFrame` 每隔一幀跳過）|
| 頁籤隱藏 | `visibilitychange` 事件偵測，背景頁籤暫停動畫迴圈 |
| 使用者控制 | 在小工具面板或設定中提供開關，偏好存入 `localStorage` |

### 季節配置格式（可擴充）

```javascript
// js/modules/seasonal/spring.js
export default {
  name: 'spring',
  particles: [
    {
      type: 'petal',            // 粒子類型名稱
      count: 20,                // 粒子數量
      colors: ['#ffb7c5', '#ffc0cb', '#ff69b4'],
      sizeRange: [8, 16],       // px
      speedRange: [0.5, 1.5],   // px/frame
      rotationSpeed: 0.02,      // rad/frame
      drift: 0.3,               // 水平飄移幅度
      shape: 'ellipse',         // ellipse | circle | image | svg
    }
  ],
  duration: null,               // null = 持續播放；數字 = 毫秒後自動停止
};
```

### 預留四季特效

| 季節 | 檔案 | 粒子類型 | 視覺效果 |
|------|------|----------|----------|
| 春 `spring` | `seasonal/spring.js` | 花瓣 (petal) | 粉色花瓣由上方飄落，帶旋轉與水平飄移 |
| 夏 `summer` | `seasonal/summer.js` | 飛鳥 (bird) / 光斑 (sparkle) | 小鳥剪影橫向飛越 + 陽光光斑閃爍 |
| 秋 `autumn` | `seasonal/autumn.js` | 落葉 (leaf) | 紅橙黃落葉由上飄落，帶搖擺與旋轉 |
| 冬 `winter` | `seasonal/winter.js` | 雪花 (snowflake) | 白色雪花緩慢飄落，大小不一 |

### 粒子引擎核心 API

```javascript
// js/modules/seasonal/engine.js
export class ParticleEngine {
  constructor(canvas, config) {}
  start() {}           // 啟動動畫迴圈
  stop() {}            // 停止並清空畫布
  pause() {}           // 暫停（保留粒子狀態）
  resume() {}          // 恢復
  setSeason(name) {}   // 切換季節配置
  setParticleCount(n) {} // 動態調整粒子數
  destroy() {}         // 移除 Canvas，清理事件監聽
}
```

### CSS 替代方案（低複雜度備選）

若判定 Canvas 效能負擔過重，可改用 CSS-only 方案：
- 10~15 個 `<div class="particle">` 元素搭配 CSS `@keyframes`
- GPU 合成（`transform` + `opacity`），比 Canvas 更省電
- 透過 `animation-delay` 錯開產生自然效果
- 適用於粒子數少、形狀簡單的場景

### 檔案結構

```
js/modules/seasonal/
├── engine.js           # 粒子引擎核心
├── spring.js           # 春季配置
├── summer.js           # 夏季配置
├── autumn.js           # 秋季配置
├── winter.js           # 冬季配置
└── index.js            # 初始化：偵測季節 → 動態 import 對應配置 → 啟動引擎
```

---

## 小工具系統 (Widget System)

### 架構設計 — 極大彈性可擴充

小工具系統以**註冊式外掛架構**設計，核心 registry 不耦合任何具體 widget。
新增小工具只需：寫一個符合介面的 JS 模組 → 註冊 → 自動出現在面板中。

### Widget 介面規範

每個 Widget 模組必須 export 一個物件，符合以下介面：

```javascript
// js/widgets/calendar.js
export default {
  id: 'calendar',                    // 唯一識別碼
  name: { 'zh-TW': '日曆', en: 'Calendar', vi: 'Lịch', th: 'ปฏิทิน', id: 'Kalender' },
  icon: 'calendar.svg',             // SVG 圖示
  defaultEnabled: true,             // 預設是否啟用
  position: 'sidebar',              // sidebar | header | footer | floating
  priority: 10,                     // 排序權重（數字越小越前）
  refreshInterval: 60000,           // 自動更新間隔（ms），0 = 不自動更新

  // 生命週期
  init(container) {},               // 首次初始化，接收 DOM 容器
  update() {},                      // 定時或手動更新
  onLanguageChange(lang) {},        // 語系切換回呼
  onThemeChange(theme) {},          // 主題切換回呼
  destroy() {},                     // 清理資源
};
```

### Widget Registry（核心）

```javascript
// js/modules/widget-registry.js
class WidgetRegistry {
  #widgets = new Map();

  register(widget) {}               // 註冊 widget
  unregister(id) {}                 // 移除 widget
  getAll() {}                       // 取得所有已註冊 widget
  getEnabled() {}                   // 取得使用者啟用的 widget
  setEnabled(id, bool) {}           // 啟用/停用，存入 localStorage
  renderAll(container) {}           // 將啟用的 widget 渲染到容器
  notifyLanguageChange(lang) {}     // 廣播語系變更
  notifyThemeChange(theme) {}       // 廣播主題變更
}

export const registry = new WidgetRegistry();
```

### 預設小工具

#### 1. 日曆 Widget（含農曆）

| 項目 | 說明 |
|------|------|
| 西曆 | 月份網格（7 欄 × 6 列），標記今日、國定假日、系所活動日 |
| 農曆 | 每個日期格顯示對應農曆日期（如「初五」）、節氣、傳統節日 |
| 農曆實作 | 使用 1900-2100 預計算查表法（~4KB 編碼資料 + ~150 行解碼邏輯），不使用天文演算法 |
| 切換 | 可切換月份，點擊日期可查看當日事件 |
| 尺寸 | 最小 280px 寬，響應式收合 |

#### 2. 時鐘 Widget

| 項目 | 說明 |
|------|------|
| 顯示 | 即時時間（HH:MM:SS）+ 日期 + 星期 |
| 格式 | 依語系自動切換格式（中文用年月日、英文用 Month Day, Year 等）|
| 更新 | `setInterval` 每秒更新，`visibilitychange` 暫停/恢復 |

#### 3. 天氣預報 Widget

| 項目 | 說明 |
|------|------|
| 資料來源 | 中央氣象署開放資料 API（免費、無 CORS 限制、繁體中文）或 OpenWeatherMap |
| 預設地點 | 台中市霧峰區（CYUT 校址），不需使用者定位 |
| 顯示 | 今日天氣圖示 + 溫度 + 降雨機率 + 簡述 |
| 快取 | `localStorage` 快取 30 分鐘 TTL，減少 API 呼叫 |
| API Key 安全 | 若使用需 key 的 API，透過 serverless proxy 隱藏 key；若使用政府開放資料則免 key |
| 錯誤處理 | API 失敗時顯示「暫時無法取得天氣資訊」，不影響其他功能 |
| 天氣圖示 | 使用 SVG 向量圖：`weather-sunny.svg`, `weather-cloudy.svg`, `weather-rainy.svg` 等 |

#### 4. 國定假日倒數 Widget

| 項目 | 說明 |
|------|------|
| 資料 | 內建台灣國定假日清單（JSON 格式，含農曆節日對應的西曆日期）|
| 顯示 | 距離下一個國定假日的天數倒數 + 假日名稱 |
| 更新 | 每日午夜更新；跨年時自動載入下年度資料 |
| 多語 | 假日名稱支援六語翻譯 |

### Widget 面板 UI

小工具集中在一個可展開/收合的側邊欄面板中：

```html
<aside class="widget-panel" aria-label="小工具面板">
  <button class="widget-panel__toggle" aria-expanded="false">
    <!-- gear.svg -->
  </button>
  <div class="widget-panel__body">
    <!-- 各 Widget 依 priority 排序渲染於此 -->
  </div>
</aside>
```

- 桌面版：右側邊欄常態展開或收合
- 行動版：底部上滑面板或全屏 overlay
- 使用者可拖曳排序（可選未來擴充）、啟用/停用個別 widget

### 新增 Widget 的步驟（開發者指南）

1. 在 `js/widgets/` 建立新檔案（如 `pomodoro.js`）
2. Export 符合 Widget 介面的物件
3. 在 `js/widgets/index.js` 的註冊清單中加入 `import` 並 `registry.register()`
4. 若需要新 SVG 圖示，放入 `assets/icons/svg/`
5. 若需要新 i18n key，更新 6 個語系 JSON 檔
6. 完成 — Widget 自動出現在面板中

### 檔案結構

```
js/
├── modules/
│   └── widget-registry.js          # Widget 核心 registry
├── widgets/
│   ├── index.js                    # 匯入並註冊所有 widget
│   ├── calendar.js                 # 日曆（含農曆）
│   ├── clock.js                    # 時鐘
│   ├── weather.js                  # 天氣預報
│   └── holiday-countdown.js        # 國定假日倒數
assets/icons/svg/
├── widget-calendar.svg
├── widget-clock.svg
├── widget-weather-sunny.svg
├── widget-weather-cloudy.svg
├── widget-weather-rainy.svg
├── widget-weather-stormy.svg
└── widget-countdown.svg
```

---

## 管理後台對接架構 (Admin & CMS Integration)

> 本段定義前端如何與現有後台系統對接，包含登入驗證、資料讀寫 API 契約、
> 可編輯內容區域映射、檔案上傳預留、以及後端可替換的抽象層設計。

### 架構概覽

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  前台網站     │────▶│  DataService.js  │────▶│  現有後台 API     │
│  (靜態 HTML)  │◀────│  （抽象層）        │◀────│  (待對接)         │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                    │
       │              ┌─────┴─────┐
       │              │ 快取層     │
       │              │ sessionStorage │
       │              │ + TTL 管理  │
       │              └───────────┘
       │
┌──────┴──────┐
│  /admin/     │
│  管理後台 SPA │──── 登入驗證 ──── 現有後台認證
│  (獨立頁面)   │
└─────────────┘
```

### 前台可編輯內容區域映射

**以下每個區塊的內容在前台以 HTML 靜態呈現（SEO 友善），同時預留 `data-cms` 屬性標記，
DataService 載入後以 API 資料覆蓋靜態內容：**

| 前台區塊 | `data-cms` 值 | 可編輯欄位 | 後台操作 |
|----------|---------------|-----------|----------|
| **Banner 輪播** `#hero-banner` | `data-cms="banner"` | 圖片 / 標題 / 說明文字 / 連結 / 排序 | 上傳圖片 + 設定文字 |
| **最新公告** `#announcements [data-tab="announce"]` | `data-cms="announcements"` | 標題 / 日期 / 內文 / 分類 / 附件 | 富文字編輯器 + 檔案附件 |
| **工讀資訊** `#announcements [data-tab="parttime"]` | `data-cms="parttime"` | 同上 | 同上 |
| **獎助學金** `#announcements [data-tab="scholarship"]` | `data-cms="scholarship"` | 同上 | 同上 |
| **榮譽榜** `#honor-roll` | `data-cms="honors"` | 標題 / 日期 / 連結 / 圖片（可選） | CRUD + 排序 + 上下架 |
| **影音專區** `#video-section` | `data-cms="videos"` | 影片 URL(YouTube/本機) / 標題 / 封面圖 | 貼上影片連結或上傳 |
| **系所成員**（子頁面） | `data-cms="faculty"` | 姓名 / 職稱 / 專長 / Email / 照片 / 分機 / 辦公室 | 編輯個人資料 + 上傳照片 |
| **下載專區**（子頁面） | `data-cms="downloads"` | 檔名 / 分類 / 檔案(PDF/DOC/XLS) / 上傳日期 | 上傳 + 分類 + 刪除 |
| **招生資訊**（子頁面） | `data-cms="admission"` | 富文字頁面內容 | 富文字編輯器 |
| **規章辦法**（子頁面） | `data-cms="regulations"` | 富文字頁面內容 + 附件 | 富文字 + 檔案上傳 |

### HTML 預留標記規範

每個可編輯區塊在 HTML 中同時包含：
1. **靜態預設內容**（SEO 爬蟲可讀 + API 不可用時 fallback）
2. **`data-cms` 屬性**（DataService 辨識並覆蓋的掛載點）
3. **`data-cms-list` 或 `data-cms-page`**（標記資料類型：列表或單頁）

```html
<!-- 公告區塊：靜態 HTML 為 fallback，JS 載入後以 API 資料覆蓋 -->
<section id="announcements" data-section="announcements"
         data-cms="announcements" data-cms-list="true">
  <h2 data-i18n="section.news">最新消息</h2>

  <!-- 靜態預設內容（後台不可用時顯示） -->
  <ul class="announce-list" data-cms-target="list">
    <li>
      <time class="announce-date" datetime="2025-03-20">2025-03-20</time>
      <a href="#">113學年度第2學期碩士班學位口試相關事宜公告</a>
    </li>
    <!-- ... 靜態內容 ... -->
  </ul>
</section>

<!-- Banner 輪播：圖片來源可由後台替換 -->
<section id="hero-banner" data-cms="banner" data-cms-list="true">
  <div class="banner-slides" data-cms-target="slides">
    <div class="banner-slide" data-cms-item="1">
      <picture>
        <source srcset="assets/images/original/banner.webp" type="image/webp"
                data-cms-field="image">
        <img src="assets/images/original/banner.png" alt="..." loading="eager"
             data-cms-field="image">
      </picture>
      <h2 data-cms-field="title" data-i18n="banner.slide1.title">歡迎來到休閒事業管理系</h2>
      <p data-cms-field="description" data-i18n="banner.slide1.desc">培養具備休閒產業管理專業知能之人才</p>
    </div>
  </div>
</section>
```

### DataService 抽象層（`js/modules/data-service.js`）

統一的資料存取介面，前端所有模組透過此層取得後端資料。後端 API 可替換而不影響前端。

```javascript
// js/modules/data-service.js

const API_BASE = '{{API_BASE_URL}}';  // build 時注入，預設為現有後台 API 位址
const CACHE_PREFIX = 'cms-cache-';
const DEFAULT_TTL = 5 * 60 * 1000;    // 5 分鐘快取

class DataService {
  // ---- 公告 ----
  async getAnnouncements(category, page = 1, limit = 10) {}
  async getAnnouncementById(id) {}

  // ---- 榮譽榜 ----
  async getHonors(page = 1, limit = 10) {}

  // ---- Banner ----
  async getBanners() {}

  // ---- 影音 ----
  async getVideos() {}

  // ---- 系所成員 ----
  async getFaculty() {}
  async getFacultyById(id) {}

  // ---- 下載專區 ----
  async getDownloads(category) {}

  // ---- 頁面內容（招生、規章等富文字頁面）----
  async getPageContent(slug) {}

  // ---- 通用方法 ----
  async _fetch(endpoint, ttl = DEFAULT_TTL) {
    const cacheKey = CACHE_PREFIX + endpoint;
    const cached = this._readCache(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      this._writeCache(cacheKey, data, ttl);
      return data;
    } catch (err) {
      console.warn(`[DataService] ${endpoint} failed:`, err.message);
      return null;  // null 表示 API 不可用，前端顯示靜態 fallback
    }
  }

  _readCache(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const { data, expires } = JSON.parse(raw);
      if (Date.now() > expires) { sessionStorage.removeItem(key); return null; }
      return data;
    } catch { return null; }
  }

  _writeCache(key, data, ttl) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, expires: Date.now() + ttl }));
    } catch { /* quota exceeded — 靜默失敗 */ }
  }
}

export const dataService = new DataService();
```

**設計要點：**
- API 不可用時回傳 `null`，前端模組判斷 `null` 就保留 HTML 中的靜態內容（graceful degradation）
- 快取用 `sessionStorage`（頁面關閉即清除，避免使用者看到過期資料）
- `API_BASE` 由 build script 注入（同 `{{VERSION}}` 和 `{{BASE_URL}}`）
- 所有 API 呼叫集中在此類，禁止其他模組直接呼叫 `fetch` 存取後端 API

### API 契約（供後端對接參考）

前端預期的 API 端點格式（RESTful JSON）：

| 端點 | Method | 回應格式 | 說明 |
|------|--------|----------|------|
| `/api/announcements?category={cat}&page={n}&limit={n}` | GET | `{ items: [...], total, page }` | 公告列表 |
| `/api/announcements/{id}` | GET | `{ id, title, date, body, attachments, category }` | 單則公告 |
| `/api/honors?page={n}&limit={n}` | GET | `{ items: [...], total }` | 榮譽榜 |
| `/api/banners` | GET | `[ { id, image, title, description, link, order } ]` | 輪播圖片 |
| `/api/videos` | GET | `[ { id, url, title, thumbnail } ]` | 影音 |
| `/api/faculty` | GET | `[ { id, name, title, expertise, email, photo, office, ext } ]` | 系所成員 |
| `/api/downloads?category={cat}` | GET | `{ items: [ { id, filename, url, size, date, category } ] }` | 下載檔案 |
| `/api/pages/{slug}` | GET | `{ slug, title, body_html, attachments }` | 富文字頁面 |
| `/api/auth/login` | POST | `{ token, expires }` | 管理者登入 |
| `/api/auth/verify` | GET | `{ valid: true, user }` | 驗證 token |

**後端對接注意：**
- 以上為前端預期格式，實際對接現有後台時由 DataService 內部做欄位映射（adapter pattern）
- 若現有後台 API 格式不同，僅需修改 DataService 的各 `get*()` 方法做欄位轉換
- 前端不直接依賴後台的欄位名稱或 URL 結構

### 管理後台頁面（`/admin/`）

獨立的管理頁面，與前台分離：

```
admin/
├── index.html          # 登入頁 + 登入後的管理儀表板 SPA
├── css/admin.css       # 後台專用樣式（不影響前台）
└── js/admin.js         # 後台專用邏輯（登入 + CRUD + 上傳）
```

**登入驗證流程：**

```
使用者輸入帳密 → POST /api/auth/login → 取得 JWT token
→ 存入 sessionStorage('admin-token') → 後續 API 請求附帶 Authorization header
→ 頁面關閉或 token 過期 → 自動登出，清除 sessionStorage
```

**安全規則：**
- Token 存入 `sessionStorage`（非 localStorage），瀏覽器關閉即清除
- 所有管理 API 請求附帶 `Authorization: Bearer {token}` header
- 登入頁使用 HTTPS（由部署環境確保）
- 前台頁面**不載入** admin.js，避免暴露管理功能
- `/admin/` 路徑可在 robots.txt 中 Disallow

### 檔案上傳規範

| 規則 | 說明 |
|------|------|
| 檔案類型白名單 | 圖片：`.jpg`, `.png`, `.webp`, `.gif`；文件：`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx` |
| 單檔大小限制 | 圖片 ≤ 5MB、文件 ≤ 20MB（由後端驗證） |
| 圖片自動處理 | 上傳後後端自動產生 WebP 版本 + 縮圖（thumbnail 400px 寬）|
| 命名規則 | 後端以 `{timestamp}-{hash}.{ext}` 格式儲存，避免中文檔名與衝突 |
| 路徑 | 上傳檔案統一存放在後端的 `/uploads/` 目錄，前端透過 API 回傳的 URL 引用 |

### 前端模組如何消費 DataService

```javascript
// js/modules/tabs.js — 公告載入範例
import { dataService } from './data-service.js';

async function loadAnnouncements(category) {
  const data = await dataService.getAnnouncements(category);

  if (!data) {
    // API 不可用 → 保留 HTML 中的靜態 fallback 內容，不做任何操作
    return;
  }

  // API 成功 → 用 template cloning 渲染新內容，替換靜態 fallback
  const container = document.querySelector(`[data-cms="${category}"] [data-cms-target="list"]`);
  container.innerHTML = '';
  data.items.forEach(item => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.announce-date').textContent = item.date;
    clone.querySelector('.announce-date').setAttribute('datetime', item.date);
    clone.querySelector('a').textContent = item.title;
    clone.querySelector('a').href = item.url || '#';
    container.appendChild(clone);
  });
}
```

### 檔案結構更新

```
朝陽/
├── ... (既有結構)
├── admin/                      # 管理後台（獨立，不影響前台）
│   ├── index.html              # 登入 + 儀表板
│   ├── css/admin.css           # 後台樣式
│   └── js/admin.js             # 後台邏輯（登入/CRUD/上傳）
├── js/
│   ├── modules/
│   │   ├── data-service.js     # API 抽象層（所有後端資料存取集中於此）
│   │   └── ... (既有模組)
```

### data-service.js 模組規則

| 規則 | 說明 |
|------|------|
| 唯一出口 | `export { dataService }`（單例） |
| 依賴方向 | tabs.js / banner.js / scroll-effects.js 可 import data-service.js |
| 反向禁止 | data-service.js 不可 import 任何其他模組 |
| localStorage key | 不使用 localStorage（用 sessionStorage），key 前綴 `cms-cache-` |
| 載入策略 | 靜態 import（tabs/banner 等首屏模組需要） |
| API 不可用 | 回傳 `null`，呼叫端保留靜態 fallback，不 throw |

### 新增依賴矩陣更新

| 模組 | 可以 import | 新增 |
|------|------------|------|
| `data-service.js` | 無（獨立基礎模組） | — |
| `tabs.js` | `templates/announcement-card.js` | + `data-service.js` |
| `banner.js` | 無 | + `data-service.js`（載入後台設定的輪播圖） |
| `scroll-effects.js` | `templates/honor-item.js` | + `data-service.js`（載入榮譽榜資料） |

### 新增 localStorage / sessionStorage key 登記

| Key | 模組 | 儲存位置 | 值 |
|-----|------|----------|-----|
| `cms-cache-{endpoint}` | data-service.js | sessionStorage | `{ data, expires }` JSON |
| `admin-token` | admin.js | sessionStorage | JWT string |

### build.sh 更新

新增 `{{API_BASE_URL}}` 佔位符注入：

```bash
API_BASE_URL="${API_BASE_URL:-/api}"  # 預設為同域 /api
# 加入所有 sed 命令：
-e "s|{{API_BASE_URL}}|${API_BASE_URL}|g"
```

---

## 無障礙規範 (WCAG 2.1 AA)

- 顏色對比度最低 4.5:1（正文）/ 3:1（大字）— **所有色碼已通過審計驗證**
- 所有互動元素可用鍵盤操作
- 焦點指示器清晰可見（不移除 `outline`，使用自訂樣式）
- 表單元素使用 `<label>` 關聯
- 動態內容更新使用 `aria-live` 區域
- `<a href="#main-content" class="skip-link">跳至主要內容</a>` 必須在 `<body>` 第一個元素
- 圖片 `alt` 屬性不可遺漏
- oklch() 色彩需提供 `@supports` 守衛 + `hsl()` fallback
- 季節特效、小工具動畫全部遵守 `prefers-reduced-motion: reduce`

---

## 審計修正紀錄

以下為三位 AI 專家審計後確認的修正項目，已全部反映至規範中：

### 色彩對比度修正 (WCAG)

| Token | 原值 | 修正值 | 原因 |
|-------|------|--------|------|
| Light `--color-text-muted` | oklch(55%) | **oklch(50%)** | 小字對比 3.54:1 → 4.48:1 (AA PASS) |
| Light `--color-text-placeholder` | oklch(70%) | **oklch(63%)** | 2.32:1 → 3.00:1 |
| Dark `--color-text-muted` | oklch(48%) | **oklch(56%)** | 3.01:1 → 4.50:1 (AA PASS) |
| Dark `--color-text-placeholder` | oklch(40%) | **oklch(45%)** | 2.32:1 → 3.01:1 |
| Light `--color-bg-alt` | oklch(98% 0.003 **265**) | oklch(98% 0.005 **80**) | 冷灰→微暖灰，注入學術溫度 |

### UX 架構修正

| 項目 | 原設計 | 修正後 | 原因 |
|------|--------|--------|------|
| 回到頂部 | 併入 FAB | **獨立保留** | 一級操作不應藏在二級選單後 |
| No-Wrap 下拉選單 | 全部 nowrap | **允許 wrap**（min/max-width 約束）| 泰/越語翻譯膨脹 40~60%，nowrap 會截成亂碼 |
| 行動導覽 | 水平滑動 | **漢堡垂直堆疊** | 水平滑動隱藏項目，損害可發現性 |
| Modal 不再顯示 | 以日期為 key | **以公告內容 hash 為 key** | 內容不變時不重複彈出，變更時自動再顯示 |
| Web Components | Shadow DOM | **`<template>` + cloneNode** | 避免 Shadow DOM 阻斷 CSS Custom Properties 繼承 |
| View Transitions / Scroll Animations | 直接使用 | **加 `@supports` 守衛 + fallback** | Firefox/Safari 支援度 ~72-75% |

### 效能修正

| 項目 | 修正 |
|------|------|
| CJK 字型 | 系統字型優先 fallback + Google Fonts unicode-range 子集化，僅載入 400/700 |
| CSS 檔案 | Production 合併為單檔，消除 4 檔 waterfall |
| JS 模組 | 關鍵模組加 `<link rel="modulepreload">`，非首屏模組動態 `import()` |
| LCP 圖片 | `loading="eager"` + `fetchpriority="high"`，禁止 lazy-load |
| Canvas 特效 | 行動裝置預設關閉、30fps throttle、`visibilitychange` 暫停、最大 30 粒子 |
| 天氣 API | localStorage 快取 30min、優先使用免 key 政府 API |

---

## 開發守則

1. **功能不滅原則**：任何改動前先對照 `docs/features.md` 確認不遺漏基線功能
2. **原生優先**：能用 CSS/JS 原生 API 解決的，不引入第三方套件
3. **模組單責**：一個 JS 模組只負責一個功能領域
4. **漸進增強**：基礎功能在無 JS 環境也可使用；CSS 新特性一律用 `@supports` 守衛
5. **行動優先**：CSS 先寫行動版，再用 `min-width` 媒體查詢擴展
6. **語義優先**：選擇 HTML 標籤基於語義，非外觀
7. **不使用 `!important`**：透過 `@layer` 管理優先級
8. **不使用 ID 選擇器做樣式**：ID 僅用於 JS hook 和 ARIA 關聯
9. **圖片提供 WebP**：所有點陣圖提供 WebP 格式 + fallback
10. **提交前驗證**：HTML 通過 W3C 驗證、CSS 無語法錯誤、JS 無 console.error
11. **z-index 使用變數**：禁止寫裸數字，一律引用 `--z-*` 變數
12. **禁止 Font Awesome**：所有圖示使用 inline SVG，現有 HTML 中的 `<i class="fas/fab ...">` 必須遷移
13. **色碼禁止寫死**：所有顏色一律使用 `var(--color-*)`，確保深淺主題連動
14. **外掛式擴充**：新功能（Widget / 季節特效）透過註冊機制加入，不修改核心程式碼
15. **部署域名變數化**：所有 SEO URL（canonical / og:url / JSON-LD / sitemap）使用 `{{BASE_URL}}`，build 時注入

---

## 第二次審計修正紀錄（六專家共識）

以下為六位 AI 專家（架構一致性 / DevOps / SEO / i18n / 元件設計 / 效能）同時審計後的共識修正。

### 一、features.md 矛盾修正（6 處）

| 位置 | 原文 | 修正為 | 原因 |
|------|------|--------|------|
| W-3 | 行動導覽水平滑動 | **行動導覽垂直堆疊** | 水平滑動隱藏項目，損害可發現性 |
| R-1~R-3 | 1000px 固定 / 行動 / 斷點偵測 | **桌面流動 / 平板兩欄 / 手機單欄** | 對齊 CLAUDE.md 的行動優先 + 三斷點設計 |
| I-2 | `?Lang=` (大寫) | **`?lang=`（向下相容 `?Lang=`）** | 統一小寫為新標準 |
| M-3 | 日期戳記 | **內容 hash** | 內容不變不重複彈、變更自動再顯示 |
| M-6 | `<body>` | **`document.documentElement`** | 統一與 CLAUDE.md 一致 |
| B-2 | 含「回到頂部」 | **移除，回到頂部獨立於 N-5** | 一級操作不應藏在二級選單後 |

### 二、CLAUDE.md 內部矛盾修正（5 處）

| 位置 | 原文 | 修正為 |
|------|------|--------|
| Baseline 區段 | 僅列 13 類（51 項） | **補齊 18 類（89 項）全部受保護** |
| Baseline W-3 摘要 | 「行動版水平滑動」 | **「行動版漢堡垂直堆疊」** |
| JS 技術表 | Custom Elements / Web Components | **`<template>` + cloneNode** |
| Modal z-index | 裸數字 9000/9001 | **`var(--z-modal-overlay)` / `var(--z-modal)`** |
| FAB z-index | 裸數字 8000 | **`var(--z-fab)`** |

### 三、Build Script 修正（4 處）

| 問題 | 修正 |
|------|------|
| 僅支援 4 檔拆分 CSS，單檔 style.css 會跳過 | 加入 `elif [ -f css/style.css ]` fallback，缺 CSS 時 `exit 1` |
| 子頁面輸出到 `dist/` 而非 `dist/pages/` | 改為 `dist/$f` 保留目錄結構 |
| sed 分隔符 `/` 遇特殊字元會壞 | 改用 `\|` 分隔符 |
| `((WEBP_COUNT++))` 在 `set -e` 下脆弱 | 改為 `WEBP_COUNT=$((WEBP_COUNT + 1))` |

### 四、SEO 修正（5 處）

| 問題 | 修正 |
|------|------|
| SearchAction 指向不存在的 `/search` | **移除 potentialAction 區塊** |
| sitemap.xml 列 9 個不存在的頁面 | **僅保留首頁，新頁面建立後再加入** |
| 硬編碼 `leisure.cyut.edu.tw` 域名 | **全部改用 `{{BASE_URL}}` 佔位符** |
| robots.txt 允許爬蟲進入 scripts/docs/ | **加入 Disallow 規則** |
| `changefreq: weekly` 不切實際 | **改為 monthly** |

### 五、i18n 補充規範（5 處新增）

#### 混合內容翻譯策略

對於含有子元素的可翻譯節點（如圖示 + 文字），禁止直接替換 `textContent`：

```html
<!-- 正確：拆分可翻譯文字到獨立 <span> -->
<a href="index.html">
  <svg>...</svg>
  <span data-i18n="nav.home">回首頁</span>
</a>
```

若翻譯文字需含 HTML（如 `<br>`），使用 `data-i18n-html="key"` 屬性以 `innerHTML` 替換，僅允許白名單標籤。

#### 越南語字型

Noto Sans TC 不覆蓋越南語組合字元（U+1EA0-U+1EF9），需指定 Noto Sans：

```css
[lang="vi"] {
  --font-body: "Noto Sans", "Noto Sans TC", sans-serif;
}
```

僅在 `lang="vi"` 時動態載入 `Noto+Sans:wght@400;700&subset=vietnamese`。

#### 泰語字型防 FOUT

切換泰語時 Noto Sans TC 無泰語字符會顯示方塊。解法：
- 在 head 預置 `<link rel="preload" ... media="none">` 的泰語字型連結
- 切換語系時移除 `media="none"` 啟動載入
- 等待 `document.fonts.ready` 包含 Noto Sans Thai 後才顯示翻譯
- fallback 字型鏈加入 Windows 內建泰語字型：`"Tahoma", "Leelawadee UI"`

#### 印尼語注意事項

- 字型：標準 Latin 字型即可，無需額外載入
- 日期格式：`DD/MM/YYYY`（與中文 `YYYY/MM/DD` 和英文 `MM/DD/YYYY` 不同）
- 數字格式：千分位用點號 `.`，小數用逗號 `,`（如 `1.000.000,50`）
- 翻譯風格：使用正式書面語（bahasa baku），非口語（bahasa gaul）
- 日期/數字格式化統一使用 `Intl.DateTimeFormat` / `Intl.NumberFormat` 搭配 locale `'id-ID'`

#### 翻譯維護策略

| 語系 | 維護方式 |
|------|----------|
| zh-TW | 系辦直接維護（主檔，所有 key 必須先在此定義）|
| zh-CN | OpenCC 自動繁簡轉換 + 人工校對 |
| en | AI 翻譯初版 + 國際事務處校閱 |
| vi / th / id | AI 翻譯初版 + 國際產學專班學生校閱 |

輔助腳本：`scripts/i18n-sync.mjs` 比對各語系 missing/extra keys。

#### 動態內容翻譯政策

| 內容類型 | 策略 |
|----------|------|
| UI 標籤（導覽/按鈕/區塊標題）| 六語完整翻譯 |
| 公告標題/榮譽榜/影片標題 | **維持 zh-TW 原文，不翻譯** |
| 日期格式 | 依語系格式化（`Intl.DateTimeFormat`）|
| 外部系統名稱（TronClass 等）| 不翻譯（專有名詞）|

### 六、Widget 系統補充規範（6 處新增）

#### Timer 管理歸屬 WidgetRegistry

Registry 集中管理所有 Widget 的 refreshInterval timer：
- `manageTimers()` / `pauseAllTimers()` / `resumeAllTimers()`
- 統一 `visibilitychange` 監聽，背景頁籤暫停所有 timer
- 個別 Widget 禁止自行啟動 `setInterval`，一律透過 `refreshInterval` 宣告

#### 錯誤隔離

所有 lifecycle callback（`init`, `update`, `onLanguageChange`, `onThemeChange`, `destroy`）由 Registry 包裹 `try/catch`。單一 Widget 失敗不影響其他 Widget。

#### Widget 面板尺寸

| 狀態 | 寬度 | 行為 |
|------|------|------|
| 收合 | 48px（僅 toggle 按鈕）| 不影響內容 |
| 展開 (≥1024px) | 300px | `<main>` 增加 `padding-right: 300px` |
| 展開 (<1024px) | overlay 全寬 | 半透明 backdrop，不推移內容 |

Z-index：`--z-widget-panel: 150`（已加入 z-index 系統）

#### CWA 天氣 API 修正

| 項目 | 修正 |
|------|------|
| 需要 key | **是**（需註冊 opendata.cwa.gov.tw 取得 Authorization key）|
| 端點 | `F-D0047-073`（台中市未來 2 天天氣預報）|
| Key 保護 | **強制 serverless proxy**，前端不暴露 key |
| CORS | 原生支援 `Access-Control-Allow-Origin: *` |

#### 效能預算

| 限制 | 規則 |
|------|------|
| 最小 refreshInterval | 1000ms（禁止低於 1 秒的刷新）|
| 同時活躍 timer | 最多 10 個 |
| rAF 獨佔 | 僅季節引擎使用 `requestAnimationFrame`，Widget 禁止 |
| 背景暫停 | 所有 timer 和 rAF 必須在 `document.hidden` 時暫停 |

#### 季節特效精簡（v1.0）

| 項目 | 修正 |
|------|------|
| particle shape | `'ellipse' \| 'circle' \| 'image'`（移除 `'svg'`，v1.1 再議）|
| `setParticleCount()` | 移除公開 API，透過 `setSeason()` 間接調整 |
| widget position | 僅 `'sidebar'`（`'header'` / `'footer'` / `'floating'` 延至 v1.1）|
| CSS 替代方案 | 定位為獨立渲染後端，不與 Canvas 共用 config 物件 |

### 七、效能補充修正（3 處）

#### 主題偵測腳本

加入 `try/catch` 包裹 `localStorage.getItem`（Safari 隱私模式可能 throw）。

#### Skeleton 動畫

從 `background-position`（觸發 paint）改為 `::after` 偽元素 + `transform: translateX`（GPU 合成，零主執行緒開銷）。

#### contain-intrinsic-size 個別化

| 區塊 | 預估高度 |
|------|----------|
| #video-section | `auto 380px` |
| #announcements | `auto 600px` |
| #honor-roll | `auto 500px` |
| #college-depts | `auto 300px` |

禁止全部使用同一值（會造成捲軸跳動 CLS）。

---

## 第三次審計修正紀錄（八專家共識）

八位 AI 專家（安全 / 瀏覽器相容 / 無障礙深化 / 行動 UX / CSS 架構 / 規格清晰度 / 資訊架構 / 部署營運）同時審計，共 87 項發現，以下為共識修正。

### 一、CRITICAL — oklch() hsl() fallback 模式

**全票通過：整套色彩系統無 fallback，~7-8% 東南亞用戶看到完全無樣式頁面。**

所有 oklch() Custom Properties 必須以 hsl() fallback 先行，oklch 用 `@supports` 覆蓋：

```css
@layer base {
  /* === hsl fallback（所有瀏覽器） === */
  :root, [data-theme="light"] {
    --color-primary: hsl(220, 100%, 44%);
    --color-text: hsl(0, 0%, 13%);
    --color-text-secondary: hsl(0, 0%, 35%);
    --color-text-muted: hsl(0, 0%, 40%);
    --color-bg: #ffffff;
    --color-bg-alt: hsl(40, 20%, 97%);
    --color-border: hsl(0, 0%, 90%);
    --shadow-sm: 0 1px 3px hsl(0 0% 0% / 0.06);
    /* ... 所有 40+ 個 token ... */
  }

  /* === oklch 增強（現代瀏覽器） === */
  @supports (color: oklch(50% 0.14 250)) {
    :root, [data-theme="light"] {
      --color-primary: oklch(50% 0.14 250);
      --color-text: oklch(13% 0 0);
      /* ... 覆蓋所有 oklch 值 ... */
    }
  }

  /* Dark theme 同樣模式：先 hsl fallback → @supports oklch 覆蓋 */
}
```

**此模式適用於所有色彩 token 和 shadow token（shadow 中的 oklch 也需 hsl 降級）。**

### 二、CRITICAL — {{BASE_URL}} build 注入

**已修正 `scripts/build.sh`：**
- 新增環境變數 `BASE_URL="${BASE_URL:-https://leisure.cyut.edu.tw}"`
- 所有 `sed` 命令加入 `s|{{BASE_URL}}|${BASE_URL}|g`
- `robots.txt` / `sitemap.xml` 也改用 `{{BASE_URL}}` 佔位符 + build 時注入
- 新增 post-build 驗證：`grep` 檢查 `dist/` 中無殘留佔位符，失敗時 `exit 1`

### 三、CRITICAL — Content Security Policy (CSP)

在 HTML `<head>` 加入 CSP meta 標籤：

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data:;
               connect-src 'self' https://opendata.cwa.gov.tw;">
```

- `data-i18n-html` 的 innerHTML 替換必須搭配 DOM-based sanitizer（僅允許 `<br>`, `<strong>`, `<em>` 標籤）
- 禁止未經消毒的 innerHTML 操作

### 四、CRITICAL — version.mjs 格式驗證

**已修正 `scripts/version.mjs`：** 加入正則驗證 version（`/^\d+\.\d+\.\d+$/`）和 hash（`/^[a-z0-9]{4,12}$/`），不合格則 `exit 1`，防止注入攻擊。

### 五、HIGH — CSS Nesting 降級策略

CSS Nesting 在 ~8% 東南亞目標用戶（舊版 Samsung Internet / UC Browser）不支援，巢狀規則會被整個丟棄。

**策略（二擇一）：**
- **選項 A（推薦）**：加入 PostCSS Nesting 插件到 build pipeline，編譯巢狀 CSS 為平坦版：
  ```json
  // package.json devDependencies
  "postcss": "^8.0.0",
  "postcss-nesting": "^13.0.0"
  ```
- **選項 B**：限制 nesting 僅用於非關鍵樣式（hover/focus 增強），所有佈局和排版規則用平坦選擇器撰寫。

### 六、HIGH — `<script nomodule>` 降級

~5% 印尼 UC Browser/Opera Mini 用戶無 ES Module 支援，整個 JS 失效。加入：

```html
<script nomodule>
  document.body.insertAdjacentHTML('afterbegin',
    '<div style="background:#fff3cd;padding:16px;text-align:center;font-size:14px;">' +
    '您的瀏覽器版本過舊，部分功能可能無法使用。建議更新至最新版本。</div>');
</script>
```

### 七、HIGH — 無障礙補充規範

#### 7a. Banner 自動播放需暫停按鈕 + reduced-motion

WCAG 2.2.2 要求自動播放內容可暫停：
- Banner 輪播加入暫停/播放按鈕（`aria-label` 切換「暫停輪播」/「播放輪播」）
- JS 檢查 `prefers-reduced-motion: reduce` 時停止自動播放
- skeleton 動畫、FAB 展開、Modal 開關、主題切換 transition 全部加 `@media (prefers-reduced-motion: reduce) { animation: none; transition: none; }` 守衛

#### 7b. Active Tab 非色彩指示器

WCAG 1.4.1 禁止僅以色彩區分。Active tab 除色彩變更外加入：
```css
.tab-nav a.active {
  border-bottom: 3px solid var(--color-primary);
  font-weight: 700;
}
```

#### 7c. Auto-Modal 關閉焦點

自動彈出的 Modal 無觸發元素，關閉時焦點歸還至 `#main-content`（需加 `tabindex="-1"`）：
```javascript
if (!triggerElement) {
  document.getElementById('main-content').focus();
}
```

#### 7d. Seasonal Canvas ARIA

```html
<canvas id="seasonal-canvas" aria-hidden="true" role="presentation"></canvas>
```

#### 7e. 語系切換通知

加入 `aria-live="assertive"` 隱藏區域，語系切換後短暫播報新語系名稱：
```html
<div class="sr-only" aria-live="assertive" id="lang-announce"></div>
```
```javascript
document.getElementById('lang-announce').textContent = translations['_meta.name'];
```

#### 7f. Widget aria-live 規則

| Widget | aria-live | 原因 |
|--------|-----------|------|
| 天氣 | `polite` | 30 分鐘更新一次，可接受 |
| 時鐘 | **不使用**，改用 `role="timer"` | 每秒更新會讓 SR 不停播報 |
| 假日倒數 | `polite` | 每日更新一次 |
| 日曆 | 不使用 | 月份切換由使用者觸發，非自動更新 |

### 八、HIGH — 行動裝置補充

#### 8a. Safe Area Insets

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```
```css
.fab { bottom: calc(24px + env(safe-area-inset-bottom, 0px)); right: calc(24px + env(safe-area-inset-right, 0px)); }
.back-to-top { bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
.site-footer { padding-bottom: env(safe-area-inset-bottom, 0px); }
```

#### 8b. 橫向模式

```css
@media (orientation: landscape) and (max-height: 500px) {
  .banner { height: 120px; }
  .header-banner { height: 60px; }
}
```

#### 8c. 外部連結 rel 屬性

所有 `target="_blank"` 改為 `rel="noopener noreferrer"`（同組織 cyut.edu.tw 子域可僅用 `noopener`）。

### 九、MEDIUM — Print Stylesheet

```css
@layer base {
  @media print {
    .main-nav, .nav-toggle, #seasonal-canvas, .fab, .back-to-top,
    .widget-panel, .modal-overlay, .social-row, .banner-dots, .banner-arrow,
    .search-box, .lang-links, .theme-toggle, .skip-link, .skeleton
    { display: none !important; }

    :root, [data-theme="dark"] {
      --color-bg: #fff; --color-text: #000; --color-border: #ccc;
      --shadow-sm: none; --shadow-md: none; --shadow-lg: none;
    }
    * { transition: none !important; animation: none !important; }
    a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: #666; }
    .section { break-inside: avoid; }
    body { font-size: 12pt; }
  }
}
```

### 十、MEDIUM — CSS 架構補充

#### 10a. @layer no-wrap 歸屬明確化

No-wrap 規則**必須留在 base layer**，使 components layer 的 dropdown wrap 能正常覆蓋。
禁止移至 utilities layer（會破壞 dropdown 換行）。

#### 10b. BEM Modifier vs Utility 優先級

- BEM `--modifier` 控制元件狀態（`--active`, `--disabled`），在 components layer
- Utility（`u-hidden`, `u-mt-lg`）控制佈局/間距，在 utilities layer
- **禁止用 utility 覆蓋 component 的視覺狀態**

#### 10c. Container Query vs Media Query 邊界

| 使用場景 | 方式 |
|----------|------|
| 頁面佈局（header/nav/footer/main grid）| `@media` |
| section 欄數切換 | `@media` |
| 卡片內部排列（圖文方向切換）| `@container` |
| Widget 內部佈局 | `@container` |
| Tab 內容排列 | `@container` |

需要 Container Query 的元素必須宣告 `container-type: inline-size`。

#### 10d. 圓角 Token 對應表

| 元件 | Token |
|------|-------|
| input / select / textarea | `--radius-sm` (8px) |
| 按鈕（一般）| `--radius-sm` (8px) |
| 按鈕（大型 CTA）| `--radius-md` (12px) |
| 卡片（一般）| `--radius-md` (12px) |
| Modal 容器 | `--radius-lg` (16px) |
| Badge / Tag | `--radius-full` |

#### 10e. 間距補充

新增 `--space-4xl: 8rem`（128px），用於桌面版 Apple 風格的大型 section 間距。

#### 10f. Theme 切換 transition 限縮

不對全部元素套用 transition，改為 JS 切換時暫時加入 `.theme-transitioning` class 到 10 個主要 surface 元素（body, section, card, nav, header, footer, widget-panel, modal），300ms 後自動移除。

### 十一、MEDIUM — 規格清晰度補充

#### 11a. Critical CSS 範圍定義

Critical CSS 內聯在 `<style>` 中，**限定內容**：
- 所有 `:root` / `[data-theme]` Custom Properties（hsl fallback + oklch @supports）
- `.skip-link` 樣式
- `#site-header` + `#main-nav` 佈局（不含 dropdown/hover）
- `#hero-banner` 容器 + 首張 slide 尺寸
- `.skeleton` + `@keyframes skeleton-pulse`
- 目標：< 14KB 內聯

#### 11b. 開發流程

```
開發環境：
1. npx serve . -l 3000          # 或 VS Code Live Server
2. 瀏覽器開啟 http://localhost:3000
3. 開發時 index.html 直接引用 4 支 CSS（base/layout/components/utilities）
4. dist/ 是 build 產出，不手動編輯

Production build：
1. npm run build:patch          # 遞增版號 + 合併 + 注入 + 壓縮
2. dist/ 部署至 GitHub Pages 或伺服器
```

#### 11c. 季節特效 v1.0 範圍

v1.0 僅實作 Canvas ParticleEngine。CSS 替代方案延至 v1.1，不在 v1.0 實作。

#### 11d. 字型 fallback chain 說明

`"Noto Sans TC"` 列在第一位是**期望字型**；`"Microsoft JhengHei"`, `"PingFang TC"` 是離線/慢網路 fallback；`system-ui` 是最終兜底。`font-display: swap` 確保在 Google Fonts 未載入完成前先用系統字型渲染。

#### 11e. Class-based vs functional 規則

「不使用框架」禁止的是第三方 UI 框架（React/Vue/Angular）。原生 ES `class` 語法可用於有狀態子系統（ParticleEngine, WidgetRegistry）；無狀態模組（個別 widget、季節配置）用 plain object export。

### 十二、MEDIUM — 營運就緒

#### 12a. 全域錯誤監控

在 `<head>` 最前方（主題腳本之前）加入：
```html
<script>
window.addEventListener('error', function(e) {
  console.error('[CYUT]', e.message, e.filename, e.lineno);
});
window.addEventListener('unhandledrejection', function(e) {
  console.error('[CYUT Promise]', e.reason);
});
</script>
```

#### 12b. package.json 已建立

包含 `npm run dev` / `build` / `build:patch` / `build:minor` / `build:major` / `i18n:check` 腳本，`svgo` 作為 devDependency。

#### 12c. Git 初始化

本專案尚未 git init。**v1.0 實作開始前必須**：
```bash
git init && git add -A && git commit -m "Initial project setup v1.0.0"
```

#### 12d. 部署 CI/CD

建議使用 GitHub Actions `.github/workflows/deploy.yml`：push to `main` → build → deploy to GitHub Pages。build.sh 透過 `BASE_URL` 環境變數接受部署域名。

### 十三、LOW — 資訊架構調整建議

#### 13a. 國際生入口

首頁 quick-links 或 banner 加入「International Students」入口，自動偵測瀏覽器 `Accept-Language` 為 vi/th/id 時高亮顯示。

#### 13b. 非翻譯內容提示

非 zh-TW 語系時，公告/榮譽榜區塊標題下方加入小字提示：
```html
<p class="content-lang-notice" data-i18n="content.langNotice" hidden>
  以下內容僅提供中文版本
</p>
```
i18n key `content.langNotice` 各語系翻譯為該語言的「內容僅提供中文」提示。切換至非 zh-TW 時移除 `hidden`。

#### 13c. 導覽精簡

建議將「USR跨域創新應用微學程」和「精準樂活學程」移至「專班專區」下作為子項，頂層導覽從 12 項縮減至 10 項。（此為建議，非強制修正）
