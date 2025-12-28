# Manuscript Editor - 專業文稿編輯工具

一個專業的文稿初稿審查工具，提供多種自動化編輯功能，幫助您快速優化中文文稿品質。

## 功能特色

### 7 大核心功能

1. **簡體轉繁體** - 將簡體中文轉換為繁體中文（台灣用字標準）
2. **英文加空白** - 在中文與英文、數字之間自動添加空格（盤古之白）
3. **修正錯字** - 根據字典自動修正常見的錯別字
4. **刪除贅字** - 移除不必要的發語詞和重複用字
5. **修正標點** - 統一全形/半形標點符號，修正常見標點錯誤
6. **語義分段** - 根據規則將文字適當分段，提高可讀性
7. **刪除時間戳** - 移除影片字幕中的時間戳記（支援多種格式）

### 額外功能

- **差異標示** - 清楚顯示原文與處理後的差異（綠色=新增、紅色=刪除、黃色=修改）
- **統計資訊** - 顯示詳細的變更統計和處理時間
- **匯出功能** - 下載處理後的文字為 .txt 檔案
- **複製功能** - 一鍵複製處理後的文字到剪貼簿
- **歷史記錄** - 自動儲存最近 10 筆處理記錄（使用 LocalStorage）
- **離線使用** - 完全在瀏覽器端處理，無需網路連線

## 技術架構

- **框架**: Next.js 15 (App Router) + React 19 + TypeScript
- **樣式**: Tailwind CSS
- **文字處理**:
  - `opencc-js` - 簡繁轉換
  - `pangu` - 中英文空格處理
  - `diff-match-patch` - 差異計算
  - 自訂規則引擎 - 其他所有功能
- **儲存**: LocalStorage API
- **部署**: GitHub Pages (靜態網站)

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
- **歷史記錄** - 點擊「歷史記錄」載入之前處理過的文稿

## 自訂字典

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
   - 或手動觸發：Actions > Deploy to GitHub Pages > Run workflow

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
│   ├── page.tsx                # 主頁面
│   └── globals.css             # 全域樣式
├── components/
│   ├── Editor.tsx              # 主編輯器組件
│   ├── FeatureToggles.tsx      # 功能選擇
│   ├── TextAreas.tsx           # 文字輸入/輸出區域
│   ├── DiffDisplay.tsx         # 差異顯示
│   ├── ActionButtons.tsx       # 操作按鈕
│   ├── Statistics.tsx          # 統計資訊
│   └── HistoryPanel.tsx        # 歷史記錄面板
├── lib/
│   ├── processors/
│   │   ├── simplifiedToTraditional.ts    # 簡繁轉換
│   │   ├── addSpacesAroundEnglish.ts     # 英文加空白
│   │   ├── fixTypos.ts                   # 錯字修正
│   │   ├── removeRedundancy.ts           # 刪除贅字
│   │   ├── fixPunctuation.ts             # 修正標點
│   │   ├── segmentParagraphs.ts          # 語義分段
│   │   └── removeTimestamps.ts           # 刪除時間戳
│   ├── textProcessor.ts        # 處理器編排
│   ├── diffUtils.ts            # 差異計算工具
│   ├── storageUtils.ts         # LocalStorage 工具
│   ├── exportUtils.ts          # 匯出/複製工具
│   └── utils.ts                # 通用工具
├── public/
│   └── dictionaries/
│       ├── typo-dictionary.json         # 錯字對照表
│       └── redundancy-dictionary.json   # 贅字列表
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署設定
├── next.config.ts              # Next.js 設定
├── tailwind.config.ts          # Tailwind 設定
└── package.json
```

## 開發指南

### 新增處理功能

1. 在 `lib/processors/` 新增處理器檔案
2. 在 `lib/textProcessor.ts` 註冊新功能
3. 更新 `FEATURES` 陣列新增 UI 選項

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

### Q: 歷史記錄儲存在哪裡？

A: 歷史記錄儲存在瀏覽器的 LocalStorage 中，清除瀏覽器資料會同時清除歷史記錄。

### Q: 可以處理多大的文件？

A: 建議單次處理不超過 50,000 字，過大的文件可能會影響效能。

### Q: 為什麼不使用 AI？

A: 為了保持完全免費、快速和隱私，本工具使用規則引擎而非 AI。未來可能會新增選用的 AI 增強功能。

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

- [OpenCC](https://github.com/BYVoid/OpenCC) - 簡繁轉換
- [Pangu.js](https://github.com/vinta/pangu.js) - 中英文空格處理
- [diff-match-patch](https://github.com/google/diff-match-patch) - 文本差異計算
- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

**Made with ❤️ for content creators and editors**
