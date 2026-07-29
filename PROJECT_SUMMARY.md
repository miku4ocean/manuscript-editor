# Manuscript Editor - 專案總結

## 專案概覽

**專案名稱**: Manuscript Editor - 專業文稿編輯工具
**技術棧**: Next.js 16.1.1 + React 19.2.3 + TypeScript 5 + Tailwind CSS 4
**部署方式**: GitHub Pages (`output: 'export'` 純靜態網站)
**最後校對**: 2026-07-29（本檔內容已逐項對照 `package.json` 與實際程式碼核實）

## 已完成功能清單

### 核心功能（UI 7 個勾選項 / 內部 8 個 processor）

1. ✅ **簡體轉繁體** - 走 `public/dictionaries/s2t-dictionary.json` 手工字典（8,263 筆），**不是 opencc-js**
2. ✅ **英文加空白** - 自訂正則實作（未使用 pangu）
3. ✅ **修正錯字** - 基於 JSON 字典的錯字對照系統
4. ✅ **刪除贅字** - 移除發語詞和重複用字
5. ✅ **修正標點** - 全形/半形統一，修正常見標點錯誤
6. ✅ **語義分段** - 根據規則自動分段
7. ✅ **刪除時間戳** - 支援多種時間戳格式（影片字幕專用）
8. ✅ **移除多餘空白**（`removeSpaces.ts`）- 沒有獨立 UI 開關，在 1/3/4 任一啟用時自動插入流程第 2 步

### AI 輔助編輯分頁

- ✅ 5 家供應商瀏覽器直連（`lib/aiProviders.ts`：OpenAI／Anthropic／Gemini／xAI／DeepSeek）
- ✅ 金鑰存 localStorage、依供應商分開；錯誤訊息會遮蔽 `sk-…` / `Bearer …`
- ✅ token 與費用試算、回傳 usage 後顯示實際成本、匯出 .txt/.md
- ⚠️ 無伺服器、無 proxy——這是刻意的架構決定，不得改回 server-side（見 HANDOFF「地雷」）

### 額外功能

1. ✅ **差異標示** - 使用 diff-match-patch，綠色（新增）／紅色（刪除）標示變更
2. ✅ **統計資訊** - 顯示新增、刪除、變更處數、處理時間
3. ✅ **匯出功能** - 下載為 .txt 檔案，檔名包含時間戳
4. ✅ **複製功能** - 一鍵複製到剪貼簿，顯示成功提示
5. ✅ **全選/清除** - 快速切換所有功能
6. ✅ **重置功能** - 清空所有文字
7. ✅ **響應式設計** - 支援桌面、平板、手機
8. ✅ **測試** - vitest 4 + jsdom，12 檔 84 測試

> ❌ **歷史記錄已不存在**：`storageUtils.ts` 與 `HistoryPanel.tsx` 於 2026-07-25 作為死碼刪除。

## 專案結構

完整結構見 `PROJECT_STRUCTURE.md`。重點：

```
manuscript-editor/
├── app/                     # Next.js App Router（字典工具 UI 全在 page.tsx）
├── components/              # 只剩 AIEditor.tsx、TabNavigation.tsx
├── lib/
│   ├── processors/          # 8 個處理器，各附 *.test.ts
│   ├── textProcessor.ts     # 處理器編排
│   ├── aiProviders.ts       # 五家 LLM 瀏覽器直連（無伺服器）
│   ├── diffUtils.ts / exportUtils.ts / utils/paths.ts
├── public/dictionaries/     # 只放執行期會 fetch 的 3 個字典
├── scripts/                 # xlsx 字典產生腳本（.mjs）
│   └── data/                # 腳本產物與中繼資料，不對外發佈
├── types/                   # opencc-js / material-tailwind 型別宣告
├── .github/workflows/nextjs.yml   # 唯一的部署工作流程
└── next.config.ts           # output:'export' + /manuscript-editor basePath
```

## 技術亮點

### 1. 完全靜態化
- 使用 `output: 'export'` 配置
- 所有處理在客戶端執行
- 無需後端伺服器
- 可離線使用

### 2. 模組化架構
- 每個功能獨立處理器
- 可輕鬆新增/修改功能
- 處理順序可調整

### 3. 類型安全
- 全面使用 TypeScript
- 自訂類型聲明（`types/opencc-js.d.ts`、`types/material-tailwind.d.ts`）
- `npm run lint` 0 error 0 warning（2026-07-29 實測）

### 4. 效能優化
- 字典預載入（`preloadDictionaries()`）
- 差異計算使用成熟庫（diff-match-patch）
- `public/` 只放 3 個執行期字典，約 3 MB 的腳本中繼資料不隨站發佈

### 5. 使用者體驗
- 即時差異顯示
- 顏色編碼（綠/紅/黃）
- Hover 提示
- 處理時間顯示
- 複製成功反饋

## 部署指南

### 方法 1: GitHub Actions（推薦）

1. **推送到 GitHub**（repo 已存在：`https://github.com/miku4ocean/manuscript-editor`）
   ```bash
   cd /Users/leonalin/Code/manuscript-editor
   git push origin main
   ```

2. **設定 GitHub Pages**
   - 進入 Repository Settings > Pages
   - Source: GitHub Actions

3. **自動部署**
   - 每次推送 main 分支由 `.github/workflows/nextjs.yml` 觸發（實測約 1 分鐘）
   - 舊的 `deploy.yml` 是壞的（YAML 縮排錯誤，每次 0 秒失敗），已於 2026-07-29 刪除

### 方法 2: 手動部署

```bash
npm run build
npx gh-pages -d out
```

## 本地開發

```bash
# 安裝依賴
npm install

# 開發模式（熱重載）
npm run dev
# 訪問 http://localhost:3000

# 生產建置
npm run build

# 測試 / lint
npm test
npm run lint

# 預覽生產版本（production build 帶 /manuscript-editor basePath，
# 要從 out/ 的上一層 serve 才會對）
npx serve out --no-port-switching -l 3456
# 然後開 http://localhost:3456/manuscript-editor/
```

## 測試指南

### 功能測試範例

1. **簡體轉繁體**
   ```
   輸入：这是简体中文
   預期：這是簡體中文
   ```

2. **英文加空白**
   ```
   輸入：這是React範例
   預期：這是 React 範例
   ```

3. **刪除時間戳**
   ```
   輸入：[00:12] 測試內容
   預期：測試內容
   ```

## 已知限制

1. **字典依賴**: 錯字修正和贅字刪除依賴字典完整度
2. **簡繁字典覆蓋率不足（2026-07-29 實測）**: `s2t-dictionary.json` 8,263 筆是手工整理，
   抽查 60 個常見簡體字缺 12 個（汉习经济馆儿马鸟鱼车轮译）。
   根治做法是改用已安裝但目前未被引用的 `opencc-js`。
3. **語義分析**: 字典工具分頁不使用 AI，基於規則，準確度有限（要語意判斷請用 AI 分頁）
4. **文件大小**: 建議單次處理不超過 50,000 字
5. **瀏覽器**: 需要現代瀏覽器支援 ES6+

## 未來增強方向

### Phase 2 增強
- [x] ~~AI 語義分析（選用功能，需 API）~~ 已完成：AI 輔助編輯分頁，五家供應商瀏覽器直連
- [ ] 簡繁轉換改接 opencc-js（解掉上述覆蓋率問題）
- [ ] 自訂字典 UI 編輯器
- [ ] 批次文件處理
- [ ] 更多匯出格式（DOCX, PDF）
- [ ] 深色模式
- [ ] 鍵盤快捷鍵

### Phase 3 生態擴展
- [ ] Chrome/Edge 擴充套件
- [ ] VS Code 擴充套件
- [ ] API 服務化
- [ ] 協作編輯功能
- [ ] 多語言支援（英文、日文）

## 依賴項

以 `package.json` 為準（2026-07-29 核對）。**「用到」欄是全專案 grep import 的結果。**

### 生產依賴
| 套件 | 版本 | 用到？ |
|------|------|--------|
| `next` | 16.1.1 | ✅ |
| `react` / `react-dom` | 19.2.3 | ✅ |
| `diff-match-patch` | ^1.0.5 | ✅ `lib/diffUtils.ts` |
| `clsx` / `tailwind-merge` | ^2.1.1 / ^3.4.0 | ⚠️ 只有 `lib/utils.ts` 的 `cn()` 用，而 `cn()` 目前沒人引用 |
| `opencc-js` | ^1.0.5 | ❌ 零 import（只有 `types/opencc-js.d.ts` 型別宣告） |
| `@material-tailwind/react` | ^2.1.10 | ❌ 零 import（只有 `types/material-tailwind.d.ts`） |
| `react-icons` | ^5.5.0 | ❌ 零 import |

`pangu` 已於 2026-07-29 移除（零 import，`addSpacesAroundEnglish.ts` 一直是自訂正則）。
上表 ❌ 三項未一併移除，是為了留給使用者決定（opencc-js 有機會被拿來修簡繁覆蓋率問題）。

### 開發依賴
`typescript ^5`、`@types/node ^20`、`@types/react ^19`、`@types/react-dom ^19`、
`@types/diff-match-patch ^1.0.36`、`tailwindcss ^4`、`@tailwindcss/postcss ^4`、
`eslint ^9`、`eslint-config-next 16.1.1`、`vitest ^4.1.10`、`jsdom ^29.1.1`、
`xlsx ^0.18.5`（只給 `scripts/*.mjs` 讀教育部辭典 xlsx 用，不進 bundle）

## 檔案大小分析（2026-07-29 實測）

```
建置輸出 (out/):     約 1.2 MB（清掉 public/ 的 3 MB 中繼字典後）
public/dictionaries: 231 KB（3 個執行期字典）
scripts/data:        3.0 MB（腳本中繼資料，不發佈）
```

## 效能指標

- **建置時間**: 約 3 秒（Turbopack，2026-07-29 實測）
- **處理速度**: 10,000 字 < 1 秒
- **Lighthouse 分數**: 未實測（先前記載的 95+/100 查無佐證，已移除）

## 瀏覽器相容性

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile Safari: 14+
- Samsung Internet: 15+

## 授權

MIT License

---

## 開發者備註

### 關鍵決策
1. **不使用 pangu**: 因類型問題，改用自訂正則實作。
   2026-07-29 起連依賴本身都已從 package.json 移除，程式碼與文件終於一致。
2. **靜態輸出**: 為了 GitHub Pages，犧牲 SSR 優勢
3. **規則引擎**: 字典工具優先考慮免費、快速、隱私，而非 AI 準確度
4. **AI 走瀏覽器直連**: 靜態站沒有伺服器可放 proxy，且 BYOK 金鑰本來就在使用者瀏覽器，
   直連不新增外洩面。**不得改回 server proxy**（會同時打破靜態部署與安全文案）

### 技術債務
1. 簡繁字典覆蓋率不足（見「已知限制」2），建議改接 opencc-js
2. `opencc-js` / `@material-tailwind/react` / `react-icons` 三個依賴零 import，去留待決定
3. `lib/utils.ts` 的 `cn()` 沒有任何引用者
4. 差異顯示可考慮虛擬滾動（處理超長文本）
5. `xlsx@0.18.5` 有已知 npm audit 告警，但只在本機腳本使用、不進 bundle

### 貢獻指南
詳見 `README.md` 的貢獻章節。

---

**專案狀態**: ✅ 已上線（https://miku4ocean.github.io/manuscript-editor/）
**最後更新**: 2026-07-29（版本落差校對輪）
