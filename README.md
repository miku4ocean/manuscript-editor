# Manuscript Editor - 專業文稿編輯工具

[![GitHub release](https://img.shields.io/github/v/release/miku4ocean/manuscript-editor)](https://github.com/miku4ocean/manuscript-editor/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Active-success)](https://miku4ocean.github.io/manuscript-editor/)

一個專業的文稿初稿審查工具，提供多種自動化編輯功能，幫助您快速優化中文文稿品質。

## 🌐 線上體驗

👉 **[立即使用](https://miku4ocean.github.io/manuscript-editor/)**

## 功能特色

### 7 大核心功能

1. **簡體轉繁體** - 將簡體中文轉換為繁體中文（台灣用字標準）
2. **英文加空白** - 在中文與英文、數字之間自動添加空格（盤古之白）
3. **修正錯字** - 根據字典自動修正常見的錯別字
4. **刪除贅字** - 移除不必要的發語詞和重複用字
5. **修正標點** - 統一全形/半形標點符號，修正常見標點錯誤
6. **語義分段** - 根據規則將文字適當分段，提高可讀性
7. **刪除時間戳** - 移除影片字幕中的時間戳記（支援多種格式）

UI 上是 7 個勾選項；`lib/textProcessor.ts` 內部實際編排 **8 個 processor**——多出來的 `removeSpaces.ts`
（移除多餘空白）會在勾了「修正錯字／刪除贅字／簡體轉繁體」任一項時自動插入流程第 2 步。

### AI 輔助編輯（第二分頁）

- 5 家供應商（OpenAI／Anthropic／Google Gemini／xAI Grok／DeepSeek），API Key 由使用者自備
- **瀏覽器直連各家官方 API**（`lib/aiProviders.ts`），沒有任何伺服器或 proxy 經手金鑰
- 金鑰存在瀏覽器 `localStorage`，依供應商分開存放
- token 數與費用試算、呼叫後顯示實際用量成本、可匯出 `.txt` / `.md`

### 額外功能

- **差異標示** - 清楚顯示原文與處理後的差異（綠色=新增、紅色=刪除）
- **統計資訊** - 顯示詳細的變更統計和處理時間
- **匯出功能** - 下載處理後的文字為 .txt 檔案
- **複製功能** - 一鍵複製處理後的文字到剪貼簿
- **離線使用** - 字典工具分頁完全在瀏覽器端處理，無需網路連線（AI 分頁需連外）

> 歷史記錄功能**目前不存在**。舊版的 `storageUtils.ts` / `HistoryPanel.tsx` 已於 2026-07-25
> 作為死碼刪除，UI 上沒有任何入口；若日後要做需重新實作。

## 技術架構

- **框架**: Next.js 16.1.1 (App Router, Turbopack) + React 19.2.3 + TypeScript 5
- **樣式**: Tailwind CSS 4（`@tailwindcss/postcss`）
- **文字處理**:
  - 自訂 JSON 字典 + 正則規則引擎 - 全部 8 個 processor 都是自寫實作
  - `diff-match-patch` - 差異計算（唯一實際被 import 的文字處理函式庫）
- **測試**: vitest 4 + jsdom，`npm test`（12 檔 84 測試）
- **儲存**: API Key 存 localStorage（僅 AI 分頁）
- **部署**: GitHub Pages（`output: 'export'` 純靜態，`.github/workflows/nextjs.yml`）

### 依賴實況備註（2026-07-29 核對）

- `pangu` 已移除：全專案零 import，`addSpacesAroundEnglish.ts` 是自訂正則實作，
  與 PROJECT_SUMMARY「不使用 pangu，因類型問題改用自訂正則」的紀錄一致。
- `opencc-js`、`@material-tailwind/react`、`react-icons` 目前**已安裝但未被任何原始碼 import**
  （前兩者只有 `types/*.d.ts` 型別宣告檔提到）。簡繁轉換實際走
  `public/dictionaries/s2t-dictionary.json` 這份手工字典，不是 opencc。保留與否待決定。

## 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 建置生產版本

```bash
npm run build
```

建置完成後，靜態檔案會輸出到 `out/` 目錄。

### 本地預覽生產版本

```bash
npm run build
npx serve out
```

## 使用方法

1. **貼上文稿** - 在左側「原始文稿」區域貼上或輸入需要處理的文字
2. **選擇功能** - 勾選需要使用的編輯功能（可多選）
3. **處理文稿** - 點擊「處理文稿」按鈕
4. **查看結果** - 右側「處理後文稿」會顯示結果，並以顏色標示變更處
5. **匯出或複製** - 使用「匯出」或「複製」按鈕保存結果

### 快捷操作

- **全選/清除** - 快速切換所有功能的開關
- **重置** - 清空所有文字，重新開始

## 自訂字典

### 哪些字典是真的在跑的

`public/dictionaries/` 下**只有 3 個檔案**，全部都會在執行期被 `fetch()` 讀取：

| 檔案 | 由誰讀 | 用途 |
|------|--------|------|
| `s2t-dictionary.json` | `processors/simplifiedToTraditional.ts` | 簡繁對照（8,263 筆）|
| `typo-dictionary.json` | `processors/fixTypos.ts` | 錯字對照 |
| `redundancy-dictionary.json` | `processors/removeRedundancy.ts` | 贅字／發語詞 |

`public/` 會被 `output: 'export'` 整包複製進 `out/` 發佈到 GitHub Pages，
所以**只放真的要對外提供的檔案**。教育部辭典原始檔與腳本中繼產物
（`valid-words.json`、`typo-corrections.json`、`dict-sample.json` 等 7 個，約 3 MB）
已於 2026-07-29 移到 `scripts/data/`，不再隨站發佈。
`scripts/parse-dict.mjs` / `scripts/extract-typo-dict.mjs` 產出的檔案也一律寫到 `scripts/data/`。

### 錯字字典

編輯 `/public/dictionaries/typo-dictionary.json`：

```json
{
  "錯字1": "正確字1",
  "錯字2": "正確字2"
}
```

### 贅字字典

編輯 `/public/dictionaries/redundancy-dictionary.json`：

```json
{
  "fillerWords": [
    "然後",
    "那麼",
    "其實"
  ],
  "patterns": [
    "的的",
    "了了"
  ]
}
```

修改後重新建置即可生效。

## 部署到 GitHub Pages

### 方法 1: 使用 GitHub Actions（推薦）

1. **建立 GitHub Repository**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/manuscript-editor.git
git push -u origin main
```

2. **設定 GitHub Pages**

   - 前往 GitHub Repository 的 Settings > Pages
   - Source 選擇 "GitHub Actions"

3. **觸發部署**

   - 每次推送到 `main` 分支都會自動部署
   - 或手動觸發：Actions > Deploy Next.js site to Pages > Run workflow
   - 唯一的部署工作流程是 `.github/workflows/nextjs.yml`。
     舊的 `deploy.yml` 因 YAML 縮排錯誤自 2026-01 起每次 push 都 0 秒失敗、從未部署過，
     已於 2026-07-29 刪除。

4. **訪問網站**

   部署完成後，網站會發佈在：
   ```
   https://YOUR_USERNAME.github.io/manuscript-editor/
   ```

### 方法 2: 手動部署

```bash
# 建置靜態檔案
npm run build

# 部署到 gh-pages 分支
npx gh-pages -d out
```

## 專案結構

```
manuscript-editor/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 主頁面（字典工具 UI 全在這裡）
│   └── globals.css             # 全域樣式
├── components/
│   ├── AIEditor.tsx            # AI 輔助編輯分頁
│   └── TabNavigation.tsx       # 兩分頁切換
├── lib/
│   ├── processors/                           # 8 個處理器（各附 *.test.ts）
│   │   ├── simplifiedToTraditional.ts        # 簡繁轉換
│   │   ├── addSpacesAroundEnglish.ts         # 英文加空白
│   │   ├── fixTypos.ts                       # 錯字修正
│   │   ├── removeRedundancy.ts               # 刪除贅字
│   │   ├── fixPunctuation.ts                 # 修正標點
│   │   ├── segmentParagraphs.ts              # 語義分段
│   │   ├── removeTimestamps.ts               # 刪除時間戳
│   │   └── removeSpaces.ts                   # 移除多餘空白（無獨立 UI 開關）
│   ├── utils/paths.ts          # basePath 感知的字典路徑組裝
│   ├── textProcessor.ts        # 處理器編排
│   ├── aiProviders.ts          # 五家 LLM 瀏覽器直連
│   ├── diffUtils.ts            # 差異計算工具
│   ├── exportUtils.ts          # 匯出/複製工具
│   └── utils.ts                # cn() 通用工具（目前未被引用）
├── public/
│   ├── .nojekyll
│   └── dictionaries/                         # 只放執行期會 fetch 的 3 個字典
│       ├── s2t-dictionary.json               # 簡繁對照
│       ├── typo-dictionary.json              # 錯字對照表
│       └── redundancy-dictionary.json        # 贅字列表
├── scripts/
│   ├── parse-dict.mjs          # 教育部辭典 xlsx 欄位分析
│   ├── extract-typo-dict.mjs   # 從 xlsx 提取錯字/異體字
│   └── data/                   # 上兩支腳本的產物與中繼資料（不對外發佈）
├── types/                      # opencc-js / material-tailwind 型別宣告
├── .github/
│   └── workflows/
│       └── nextjs.yml          # GitHub Actions 部署設定（唯一一份）
├── next.config.ts              # Next.js 設定（output: 'export' + basePath）
├── vitest.config.ts            # 測試設定
├── tailwind.config.ts          # Tailwind 設定
└── package.json
```

## 開發指南

### 新增處理功能

1. 在 `lib/processors/` 新增處理器檔案與對應 `*.test.ts`
2. 在 `lib/textProcessor.ts` 註冊新功能（`FeatureType`、`processText`、`FEATURES`）
3. `app/page.tsx` 讀 `FEATURES` 自動長出 UI 勾選項

### 修改樣式

編輯 `tailwind.config.ts` 調整配色和樣式設定。

### 調整差異顏色

在 `lib/diffUtils.ts` 的 `getDiffColorClass` 函數中修改。

## 瀏覽器支援

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

需要現代瀏覽器支援以下 API：
- LocalStorage
- Clipboard API
- Blob API

## 常見問題

### Q: 為什麼我的字典沒有生效？

A: 確保字典檔案位於 `/public/dictionaries/` 且格式正確，修改後需要重新建置。

### Q: 我的 AI API Key 會被送到哪裡？

A: 只送到你選的那家 AI 供應商官方端點。本站是純靜態網站（`output: 'export'`），
沒有伺服器也沒有 proxy，`lib/aiProviders.ts` 是從你的瀏覽器直接 `fetch` 各家官方 API。
Key 只存在你自己的 `localStorage`。

### Q: 可以處理多大的文件？

A: 建議單次處理不超過 50,000 字，過大的文件可能會影響效能。

### Q: 字典工具和 AI 分頁差在哪？

A: 字典工具是規則引擎，免費、離線、快，但準確度受字典完整度限制；
AI 分頁需要你自備 API Key、自付費用，換取語意層級的判斷。兩者都在同一頁的兩個分頁。

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

### 貢獻指南

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 致謝

- [diff-match-patch](https://github.com/google/diff-match-patch) - 文本差異計算
- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- 教育部《重編國語辭典修訂本》- 錯字／異體字字典的原始資料來源（見 `scripts/`）

---

**Made with ❤️ for content creators and editors**
