# Project Structure - 專案結構

> 本檔於 2026-07-29 依實際檔案系統與程式碼重寫。舊版描述的
> 「Editor.tsx 為狀態管理核心 + FeatureToggles/TextAreas/DiffDisplay/…」架構
> 在 2026-07-25 的死碼清理中已整批刪除，不再適用。

```
manuscript-editor/
│
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx                  # 根布局（中文 metadata）
│   ├── page.tsx                    # 🎯 字典工具分頁 UI + 狀態（369 行，client component）
│   ├── globals.css                 # 全域樣式 + Tailwind 4
│   └── favicon.ico                 # 網站圖標
│
├── 📁 components/                   # 只剩兩個真的被引用的元件
│   ├── AIEditor.tsx                # AI 輔助編輯分頁（613 行：五家供應商 UI、金鑰、成本試算）
│   └── TabNavigation.tsx           # 兩分頁切換
│
├── 📁 lib/                          # 核心邏輯層
│   │
│   ├── 📁 processors/              # 8 個文字處理器（每個都有同名 *.test.ts）
│   │   ├── simplifiedToTraditional.ts    # Feature 1: 簡繁轉換（fetch s2t 字典）
│   │   ├── addSpacesAroundEnglish.ts     # Feature 2: 英文空格（自訂正則，非 pangu）
│   │   ├── fixTypos.ts                   # Feature 3: 錯字修正（fetch typo 字典）
│   │   ├── removeRedundancy.ts           # Feature 4: 刪除贅字（fetch redundancy 字典）
│   │   ├── fixPunctuation.ts             # Feature 5: 修正標點
│   │   ├── segmentParagraphs.ts          # Feature 6: 語義分段
│   │   ├── removeTimestamps.ts           # Feature 7: 刪除時間戳
│   │   └── removeSpaces.ts               # 移除多餘空白（無 UI 開關，編排器自動插入）
│   │
│   ├── 📁 utils/
│   │   └── paths.ts                # getDictionaryPath()：production 時補上 basePath
│   │
│   ├── textProcessor.ts            # 🎯 處理器編排器（FeatureType / processText / FEATURES）
│   ├── aiProviders.ts              # 🎯 五家 LLM 瀏覽器直連（無伺服器、無 proxy）
│   ├── diffUtils.ts                # 差異計算工具（diff-match-patch）
│   ├── exportUtils.ts              # 匯出/複製功能
│   ├── utils.ts                    # cn() 通用工具（⚠️ 目前沒有引用者）
│   └── test-dictionaries.ts        # 字典抽測輔助（非 vitest 測試）
│
├── 📁 public/                       # 靜態資源（會被 output:'export' 整包複製進 out/）
│   ├── 📁 dictionaries/            # ⚠️ 只放執行期真的會 fetch 的 3 個字典
│   │   ├── s2t-dictionary.json            # 簡繁對照（8,263 筆，189 KB）
│   │   ├── typo-dictionary.json           # 錯字對照表（25 KB）
│   │   └── redundancy-dictionary.json     # 贅字列表（11 KB）
│   ├── .nojekyll                   # GitHub Pages 設定
│   └── *.svg                       # Next 腳手架殘留圖示（未被引用）
│
├── 📁 scripts/                      # 開發期字典產生工具（不進 bundle）
│   ├── parse-dict.mjs              # 分析教育部辭典 xlsx 欄位、輸出樣本
│   ├── extract-typo-dict.mjs       # 從 xlsx 提取錯字／異體字對照
│   └── 📁 data/                    # ⚠️ 兩支腳本的產物與中繼資料，刻意不放 public/
│       ├── valid-words.json               # 161,181 個有效字詞（2.2 MB）
│       ├── typo-corrections.json          # 3,315 組原始提取結果
│       ├── typo-corrections-clean.json    # 人工挑過的小樣本
│       ├── redundancy-dictionary-expanded.json
│       ├── dict-sample.json               # 辭典前 1000 筆樣本（691 KB）
│       ├── dict-column-info.json          # 辭典欄位說明
│       └── variant-characters.json        # 異體字（目前提取結果為空 {}）
│
├── 📁 types/                        # TypeScript 類型定義
│   ├── opencc-js.d.ts              # opencc-js 型別宣告（套件本身目前未被 import）
│   └── material-tailwind.d.ts      # @material-tailwind/react 型別宣告（同上）
│
├── 📁 docs/                         # 架構圖（html/svg/mmd）
├── 📁 mockup/                       # 線框稿
│
├── 📁 .github/
│   └── workflows/
│       └── nextjs.yml              # ✅ 唯一的 GitHub Pages 部署工作流程
│                                   #    （deploy.yml 因 YAML 壞掉從未成功，2026-07-29 刪除）
│
├── 📄 next.config.ts               # output:'export'、production 加 /manuscript-editor basePath
├── 📄 vitest.config.ts             # vitest 4 + jsdom
├── 📄 eslint.config.mjs            # eslint-config-next（core-web-vitals + typescript）
├── 📄 tailwind.config.ts           # Tailwind 設定
├── 📄 tsconfig.json / postcss.config.mjs / package.json / package-lock.json
│
├── 📄 test-functions.mjs           # 檔案完整性冒煙腳本（手動跑，非 npm test）
├── 📄 test-dictionaries-simple.mjs # 字典抽測腳本（手動跑）
│
├── 📄 README.md                    # 完整使用說明
├── 📄 HANDOFF.md                   # 交接現況（接手先看這份）
├── 📄 AGENTS.md / CLAUDE.md        # agent 薄索引
├── 📄 progress.md                  # 進度報告
├── 📄 RPD.md                       # 需求、規劃、設計文檔（歷史規格，部分已不適用）
├── 📄 PROJECT_SUMMARY.md           # 專案總結
├── 📄 PROJECT_STRUCTURE.md         # 本文件
└── 📄 其他歷史文件                  # USAGE_EXAMPLES / CHECKLIST / QUICK_DEPLOY /
                                    # API_GUIDE / AI_EDITOR_GUIDE / SECURITY_AUDIT 等
```

---

## 核心檔案說明

### 🎯 關鍵檔案

#### 1. `app/page.tsx`（字典工具分頁）
- **功能**: 字典工具的全部狀態與 UI，沒有再往下拆元件
- **職責**: 管理原始／處理後文字、功能勾選狀態、呼叫 `processText`、算 diff、顯示統計與匯出

#### 2. `lib/textProcessor.ts`（處理器編排）
- **功能**: 依固定順序執行已啟用的處理器
- **順序**: 刪時間戳 → 移除多餘空白（條件觸發）→ 簡繁 → 錯字 → 贅字 → 標點 → 英文空格 → 分段
- **另負責**: `preloadDictionaries()` 預載三個字典、匯出 `FEATURES` 給 UI 產生勾選項

#### 3. `lib/aiProviders.ts`（AI 分頁後端替代品）
- **功能**: 從瀏覽器直接呼叫五家供應商官方 API
- **關鍵細節**: Anthropic 必須帶 `anthropic-dangerous-direct-browser-access: true`，
  否則被 CORS 擋下；錯誤訊息會遮蔽 `sk-…` / `Bearer …`；回傳 usage 供成本顯示

#### 4. `lib/processors/*.ts`（8 個處理器）
- 純函數設計，可獨立測試；需要字典的三個走 `fetch` + 模組級快取

---

## 資料流

### 字典工具分頁（全程瀏覽器端，零網路依賴）

```
使用者輸入 (app/page.tsx textarea)
    ↓
textProcessor.processText()
    ↓
processors/*.ts 依序執行
    ├─ 需要字典者 → fetch(getDictionaryPath(...)) → public/dictionaries/*.json
    ↓
diffUtils.calculateDiff() + calculateStatistics()
    ↓
app/page.tsx 渲染高亮與統計
```

### AI 輔助編輯分頁（瀏覽器直連，無伺服器）

```
使用者輸入文字 + 自備 API Key（存 localStorage）
    ↓
components/AIEditor.tsx 組任務描述
    ↓
lib/aiProviders.ts → fetch(供應商官方端點)   ← 沒有任何中間伺服器
    ↓
回傳文字 + usage → 顯示結果與實際成本
```

---

## 建置輸出結構

```
out/                                # 靜態輸出目錄（GitHub Pages）
├── index.html                      # 主頁面
├── 404.html                        # 404 頁面
├── _next/static/                   # JS/CSS chunks
├── dictionaries/                   # 從 public/ 複製，只有 3 個檔案
│   ├── s2t-dictionary.json
│   ├── typo-dictionary.json
│   └── redundancy-dictionary.json
├── favicon.ico / .nojekyll / *.svg
```

> ⚠️ production build 會加上 `/manuscript-editor` basePath，
> 所以本機預覽時 `out/` 必須掛在 `/manuscript-editor/` 路徑下才會對，
> 直接 `npx serve out` 開根目錄會全部 404。

---

## 檔案統計（2026-07-29 實測）

| 類型 | 檔案數 | 總行數 |
|------|--------|--------|
| TypeScript/React（app/components/lib/types，含測試）| 33 | 3,687 |
| 其中 vitest 測試檔 | 12 | — |
| 執行期 JSON 字典 | 3 | — |

`npm test`：12 檔 84 測試全綠。`npm run lint`：0 error 0 warning。

---

## 開發工作流程

### 1. 新增功能
```
lib/processors/newFeature.ts + newFeature.test.ts
    ↓
lib/textProcessor.ts（加 FeatureType、加進 processText 順序、加進 FEATURES）
    ↓
app/page.tsx 讀 FEATURES 自動產生 UI，不需另外改
```

### 2. 更新字典
```
public/dictionaries/*.json     （只有這 3 個是執行期字典）
    ↓
npm run build
    ↓
確認 out/dictionaries/ 仍只有 3 個檔案
```

### 3. 重跑字典產生腳本
```
需要 /Users/leonalin/Downloads/dict_revised_2015_20250923/*.xlsx 原始檔
    ↓
node scripts/parse-dict.mjs / node scripts/extract-typo-dict.mjs
    ↓
產物寫進 scripts/data/，不會污染 public/
```

---

## 依賴關係圖

```
app/page.tsx
├── components/TabNavigation.tsx
├── components/AIEditor.tsx → lib/aiProviders.ts → 五家供應商官方 API
├── lib/textProcessor.ts
│   ├── processors/simplifiedToTraditional.ts ─┐
│   ├── processors/fixTypos.ts                 ├→ lib/utils/paths.ts → public/dictionaries/
│   ├── processors/removeRedundancy.ts        ─┘
│   ├── processors/addSpacesAroundEnglish.ts
│   ├── processors/fixPunctuation.ts
│   ├── processors/segmentParagraphs.ts
│   ├── processors/removeTimestamps.ts
│   └── processors/removeSpaces.ts
├── lib/diffUtils.ts → diff-match-patch
└── lib/exportUtils.ts
```

---

## 部署流程

```
本地開發 (npm run dev)
    ↓
npm test + npm run lint + npm run build
    ↓
輸出到 out/ 目錄
    ↓
push 到 GitHub main
    ↓
.github/workflows/nextjs.yml 觸發（唯一一份）
    ↓
部署到 https://miku4ocean.github.io/manuscript-editor/
```

---

**維護提示**:
- 所有業務邏輯集中在 `lib/`；UI 在 `app/page.tsx` 與 `components/`
- `public/` 的東西會原封不動被發佈出去，放檔案前先想清楚
- 字典檔案可熱更新（改 JSON 重 build 即可，無需改程式碼）
- 每個處理器獨立，修改不影響其他功能
