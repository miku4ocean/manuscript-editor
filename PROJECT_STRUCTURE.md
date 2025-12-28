# Project Structure - 專案結構

```
manuscript-editor/
│
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx                  # 根布局（中文 metadata）
│   ├── page.tsx                    # 主頁面（載入 Editor 組件）
│   ├── globals.css                 # 全域樣式 + Tailwind directives
│   └── favicon.ico                 # 網站圖標
│
├── 📁 components/                   # React 組件
│   ├── Editor.tsx                  # 🎯 主編輯器（狀態管理核心）
│   ├── FeatureToggles.tsx          # 7 個功能勾選框
│   ├── TextAreas.tsx               # 左右對照文字區域
│   ├── DiffDisplay.tsx             # 差異高亮顯示
│   ├── ActionButtons.tsx           # 操作按鈕組
│   ├── Statistics.tsx              # 統計資訊顯示
│   └── HistoryPanel.tsx            # 歷史記錄側邊欄
│
├── 📁 lib/                          # 核心邏輯層
│   │
│   ├── 📁 processors/              # 7 個文字處理器
│   │   ├── simplifiedToTraditional.ts    # Feature 1: 簡繁轉換
│   │   ├── addSpacesAroundEnglish.ts     # Feature 2: 英文空格
│   │   ├── fixTypos.ts                   # Feature 3: 錯字修正
│   │   ├── removeRedundancy.ts           # Feature 4: 刪除贅字
│   │   ├── fixPunctuation.ts             # Feature 5: 修正標點
│   │   ├── segmentParagraphs.ts          # Feature 6: 語義分段
│   │   └── removeTimestamps.ts           # Feature 7: 刪除時間戳
│   │
│   ├── textProcessor.ts            # 🎯 處理器編排器（主控制器）
│   ├── diffUtils.ts                # 差異計算工具
│   ├── storageUtils.ts             # LocalStorage 管理
│   ├── exportUtils.ts              # 匯出/複製功能
│   └── utils.ts                    # 通用工具（cn 函數）
│
├── 📁 public/                       # 靜態資源
│   ├── 📁 dictionaries/            # 字典檔案
│   │   ├── typo-dictionary.json           # 錯字對照表
│   │   └── redundancy-dictionary.json     # 贅字列表
│   └── .nojekyll                   # GitHub Pages 設定
│
├── 📁 types/                        # TypeScript 類型定義
│   └── opencc-js.d.ts              # opencc-js 類型聲明
│
├── 📁 .github/                      # GitHub 相關設定
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 自動部署
│
├── 📄 next.config.ts               # Next.js 配置（靜態輸出）
├── 📄 tailwind.config.ts           # Tailwind CSS 配置
├── 📄 tsconfig.json                # TypeScript 配置
├── 📄 postcss.config.mjs           # PostCSS 配置
├── 📄 package.json                 # 依賴和腳本
├── 📄 package-lock.json            # 鎖定版本
├── 📄 .gitignore                   # Git 忽略清單
│
├── 📄 README.md                    # 完整使用說明
├── 📄 RPD.md                       # 需求、規劃、設計文檔
├── 📄 PROJECT_SUMMARY.md           # 專案總結
├── 📄 PROJECT_STRUCTURE.md         # 本文件
├── 📄 USAGE_EXAMPLES.md            # 使用範例
├── 📄 CHECKLIST.md                 # 開發檢查清單
└── 📄 QUICK_DEPLOY.md              # 快速部署指南
```

---

## 核心檔案說明

### 🎯 關鍵檔案

#### 1. `components/Editor.tsx` (主編輯器)
- **功能**: 整個應用的狀態管理中心
- **職責**:
  - 管理原始文字和處理後文字
  - 管理功能開關狀態
  - 協調各組件之間的互動
  - 處理文稿處理流程
  - 管理差異計算和歷史記錄

#### 2. `lib/textProcessor.ts` (處理器編排)
- **功能**: 協調所有 7 個處理器的執行
- **職責**:
  - 按順序執行已啟用的處理器
  - 計算處理時間
  - 預載入字典檔案
  - 導出功能清單和類型定義

#### 3. `lib/processors/*.ts` (7 個處理器)
- **功能**: 各自獨立的文字處理邏輯
- **特點**:
  - 完全模組化，可獨立測試
  - 純函數設計（無副作用）
  - 支援錯誤處理和降級方案

---

## 資料流

```
User Input (TextAreas)
    ↓
Editor Component (狀態管理)
    ↓
textProcessor.ts (編排)
    ↓
processors/*.ts (7 個處理器依序執行)
    ↓
Processed Text
    ↓
diffUtils.ts (計算差異)
    ↓
DiffDisplay Component (顯示結果)
```

---

## 組件層級

```
app/page.tsx
└── Editor.tsx (主容器)
    ├── Header
    │   ├── FeatureToggles.tsx (功能選擇)
    │   └── ActionButtons.tsx (操作按鈕)
    ├── Main
    │   ├── TextAreas.tsx (文字輸入/輸出)
    │   │   └── DiffDisplay.tsx (差異顯示)
    │   └── HistoryPanel.tsx (歷史記錄，條件渲染)
    └── Footer
        └── Statistics.tsx (統計資訊，條件渲染)
```

---

## 建置輸出結構

```
out/                                # 靜態輸出目錄（GitHub Pages）
├── index.html                      # 主頁面
├── 404.html                        # 404 頁面
├── _next/
│   ├── static/
│   │   ├── chunks/                 # JavaScript 分塊
│   │   └── media/                  # 字型等媒體資源
│   └── ...
├── dictionaries/                   # 字典檔案（從 public/ 複製）
│   ├── typo-dictionary.json
│   └── redundancy-dictionary.json
└── favicon.ico
```

---

## 檔案大小統計

| 類型 | 檔案數 | 總行數 | 大小 |
|------|--------|--------|------|
| TypeScript/React | 22 | 1,862 | ~60 KB |
| JSON 字典 | 2 | ~30 | ~2 KB |
| Markdown 文檔 | 6 | ~2,000 | ~50 KB |
| 配置檔案 | 5 | ~150 | ~5 KB |
| **總計** | **35** | **~4,042** | **~117 KB** |

*不包含 node_modules 和建置輸出*

---

## 開發工作流程

### 1. 新增功能
```
lib/processors/newFeature.ts  (創建處理器)
    ↓
lib/textProcessor.ts           (註冊功能)
    ↓
components/FeatureToggles.tsx  (新增 UI 選項)
    ↓
測試並更新文檔
```

### 2. 修改樣式
```
tailwind.config.ts             (調整配色/斷點)
    ↓
components/*.tsx               (更新 className)
    ↓
app/globals.css                (全域樣式調整)
```

### 3. 更新字典
```
public/dictionaries/*.json     (編輯 JSON)
    ↓
npm run build                  (重新建置)
    ↓
測試新字典生效
```

---

## 依賴關係圖

```
Editor.tsx
├── textProcessor.ts
│   ├── simplifiedToTraditional.ts → opencc-js
│   ├── addSpacesAroundEnglish.ts
│   ├── fixTypos.ts
│   ├── removeRedundancy.ts
│   ├── fixPunctuation.ts
│   ├── segmentParagraphs.ts
│   └── removeTimestamps.ts
├── diffUtils.ts → diff-match-patch
├── storageUtils.ts
└── exportUtils.ts
```

---

## 部署流程

```
本地開發 (npm run dev)
    ↓
建置 (npm run build)
    ↓
輸出到 out/ 目錄
    ↓
推送到 GitHub
    ↓
GitHub Actions 觸發
    ↓
部署到 GitHub Pages
    ↓
https://username.github.io/manuscript-editor/
```

---

**維護提示**:
- 所有業務邏輯集中在 `lib/` 目錄
- 所有 UI 組件集中在 `components/` 目錄
- 字典檔案可熱更新（無需改代碼）
- 每個處理器獨立，修改不影響其他功能
