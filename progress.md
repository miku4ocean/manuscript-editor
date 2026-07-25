# manuscript-editor 專案進度報告

> 本文件依實際讀取的程式碼（app/、components/、lib/、public/dictionaries/）、HANDOFF.md、AGENTS.md、README.md、RPD.md、PROJECT_STRUCTURE.md、PROJECT_SUMMARY.md、AI_EDITOR_GUIDE.md，以及本機實際執行 `npm run build` 的結果撰寫。查無佐證處一律標記「未確認」，不臆造內容。撰寫日期：2026-07-24。

---

## A. 專案名稱

**manuscript-editor**（產品內部顯示名稱：「文字編輯神器」，見 `app/layout.tsx` metadata title）

---

## B. 專案路徑

`/Users/leonalin/Code/manuscript-editor`

---

## C. 專案簡介

一個以 Next.js（App Router）打造的中文文稿編輯輔助工具，單一頁面內含兩個分頁：

1. **字典工具** — 完全在瀏覽器端執行的規則式文字處理器（簡繁轉換、標點修正、錯字字典比對等），無需網路、無需伺服器。
2. **AI 輔助編輯** — 使用者自帶多家 LLM 供應商（OpenAI／Anthropic／Google／xAI／DeepSeek）的 API Key，透過一個 Next.js Route Handler 代理呼叫 AI 潤稿。

專案原始定位（見 RPD.md）是「純靜態、部署在 GitHub Pages」的免費工具；AI 分頁是後續加上去的功能，兩者之間存在實測驗證過的架構張力（詳見 G、I）。

---

## D. 專案開發目的

依 RPD.md 1.1：開發一個專業的文稿初稿審查工具，提供多種自動化編輯功能，幫助使用者快速優化中文文稿品質，且刻意選擇「純靜態網站、client-side 處理」以達成免費部署與零伺服器維運成本。AI 分頁則是在此之外，為需要更高準確度語意判斷的使用者提供付費（自付 API 費用）的加強選項（見 AI_EDITOR_GUIDE.md）。

---

## E. 解決使用者痛點

依 RPD.md 1.2、README.md 綜合：

- 內容創作者／編輯／文字工作者需要快速把簡體中文書面資料轉為繁體台灣用字。
- 影片字幕編輯者需要清除逐字稿裡的時間戳記（`[00:12:34]` 等多種格式）。
- 一般使用者常見的錯別字、贅字、標點全形半形混用、中英文間漏加空格等瑣碎但耗時的校對工作，希望能一鍵批次處理並看到清楚的差異標示。
- 想用 AI 做更細緻語意層級修正的使用者，希望能自己掌控 API Key、成本，而不被綁定單一供應商。

---

## F. 專案功能細項介紹

### 字典工具分頁（`app/page.tsx`，client component）

- 7 個功能勾選項（UI 顯示，對應 `lib/textProcessor.ts` 的 `FeatureType`）：
  簡體轉繁體／英文加空白／修正錯字／刪除贅字／修正標點／語義分段／刪除時間戳
- 實際 `lib/textProcessor.ts` 內部編排的 processor **共 8 個**（比 README 記載的 7 個多一個）：上述 7 個 + `removeSpaces.ts`（移除多餘空白，在特定功能組合下自動插入於流程第 2 步）
- diff 比對與顏色高亮（綠色新增／紅色刪除），使用 `lib/diffUtils.ts`
- 統計列：新增／刪除／修改處數、處理時間
- 匯出 `.txt`、複製到剪貼簿（`lib/exportUtils.ts`）
- 全選／清除功能勾選、重置文字

### AI 輔助編輯分頁（`components/AIEditor.tsx`）

- 5 家 AI 供應商 × 各自模型清單（含 2025 年模型與定價資訊，寫死在元件內）：OpenAI／Anthropic Claude／Google Gemini／xAI Grok／DeepSeek
- API Key 輸入框（存 `localStorage`，依供應商分開存放，切換供應商會自動帶出/清空）
- 依中文字/英文字概略比例試算 token 數與預估費用（USD + 換算台幣，匯率寫死 32.5）
- 呼叫成功後顯示「實際成本」（依伺服器回傳的 `usage` 欄位，若有）
- 5 個功能勾選（簡體轉繁體／英文檢查／修正錯字／修正標點／刪除時間戳 —— 比字典工具少「刪除贅字」「語義分段」兩個獨立開關，因為這兩件事被併入 AI prompt 的其他任務描述中）
- 匯出格式可選 `.txt` 或 `.md`

### 伺服器端（`app/api/ai-process/route.ts`）

- 單一 POST route handler，依 `provider` 分派到 5 個 `processWithXxx()` 函式，組出中文 prompt 呼叫對應官方 API
- 回傳前用正規表示式遮罩錯誤訊息中可能出現的 `sk-…`、`Bearer …` 字串，避免金鑰外洩到伺服器 log

### 已確認未接線的功能（存在程式碼與測試，但沒有使用者可觸及的介面）

- 歷史記錄（`lib/storageUtils.ts` + `components/HistoryPanel.tsx`）——README/RPD 都描述「LocalStorage 儲存最近 10 筆」，但目前 `app/page.tsx` 完全沒有引用這兩個檔案，UI 上沒有任何「歷史記錄」按鈕或面板。
- `components/Editor.tsx`、`FeatureToggles.tsx`、`TextAreas.tsx`、`ActionButtons.tsx`、`Statistics.tsx`、`DiffDisplay.tsx`、`ThemeProvider.tsx` —— 皆是舊版（RPD.md 原始規劃的「Editor 為狀態核心」架構）留下的元件，目前 `app/` 下沒有任何檔案 import 它們（已用 `grep -rn "components/Editor" app` 等指令逐一確認）。

---

## G. 專案規格及 RPD（技術棧、埠、指令、資料流）

### 技術棧（依 `package.json` 實際內容，非 README 記載的舊版本）

- Next.js `16.1.1`（App Router，Turbopack）、React `19.2.3`
- TypeScript `^5`、Tailwind CSS `^4`（`@tailwindcss/postcss`，非 README 描述的 Tailwind 3）
- `opencc-js ^1.0.5`（簡繁轉換）、`pangu ^7.2.0`（中英文空格，PROJECT_SUMMARY 曾記載「不使用 pangu 改自訂 regex」，但目前 package.json 確有安裝 pangu 依賴，實際是否被引用**未確認**——`lib/processors/addSpacesAroundEnglish.ts` 內部實作方式本次未逐行核對）
- `diff-match-patch ^1.0.5`（差異計算）、`@material-tailwind/react`、`react-icons`、`clsx`、`tailwind-merge`
- 測試：`vitest ^4.1.10` + `jsdom`（devDependency）；`xlsx` 出現在 devDependencies，用途**未確認**（推測與 `scripts/parse-dict.js` 字典整理有關，但本次未核對腳本內容）

### 埠與指令

- 開發：`npm run dev`（Next dev server，預設 `http://localhost:3000`）
- 建置：`npm run build`（本次已實際執行，成功，見下）
- 啟動（Node 伺服器模式）：`npm run start`
- Lint：`npm run lint`（依 HANDOFF.md：13 個既有錯誤、7 個警告，與本次無關，未修）
- 測試：`npm test`（`vitest run`，依 HANDOFF.md：88/88 通過）、`npm run test:watch`

### 部署配置與已實測的架構事實

- `next.config.ts`：`output: 'export'`（純靜態匯出）、`basePath`/`assetPrefix` 在 production 環境下加上 `/manuscript-editor`，明顯是為 GitHub Pages（`https://miku4ocean.github.io/manuscript-editor/`）設計。
- `.github/workflows/deploy.yml` 與 `nextjs.yml` 兩份工作流程皆會 `npm run build` 後把 `out/` 上傳到 GitHub Pages（兩份檔案內容高度重疊，是否都在使用**未確認**）。
- **本次已實際執行 `npm run build` 驗證**：build 成功，Route 摘要顯示 `/api/ai-process` 被標記為 `ƒ`（Dynamic），且 `out/` 目錄下**沒有** `api/` 相關檔案。代表正式部署到 GitHub Pages 的版本中，AI 輔助編輯分頁呼叫的 `/api/ai-process` 端點並不存在，會得到 404。此路徑僅在 `npm run dev` 或 `npm run start`（Node 伺服器模式）下才會真的運作。詳細診斷與畫面見 `docs/architecture.html` 的紅框警示區塊。
  **［2026-07-25 已修］**：AI 分頁改為瀏覽器端直連各供應商官方 API（`lib/aiProviders.ts`），`app/api/ai-process/` 已整個移除，build Route 摘要只剩 `○ /` 與 `○ /_not-found`，專案回到純靜態。詳見 I-1。

### 資料流

字典工具：使用者輸入 → `textProcessor.ts` 依序呼叫 processors（依需要 `fetch` `public/dictionaries/{typo-dictionary,redundancy-dictionary,s2t-dictionary}.json`）→ `diffUtils.ts` 算差異 → 畫面顯示。全程瀏覽器端執行。

AI 輔助編輯：使用者輸入 API Key（存瀏覽器 `localStorage`）→ 前端 POST 到 `/api/ai-process` → route handler 組 prompt → 呼叫對應 LLM 官方 API → 逐次轉發回應（不落地儲存）→ 畫面顯示。**僅在動態伺服器模式下**可完整跑通。

---

## H. 目前已完成項目

- 7 項規則式文字處理功能（實際 8 個 processor）皆已實作並有對應 `*.test.ts`，依 HANDOFF.md 全數通過（`npm test` 88/88）
- diff 高亮顯示、統計列、複製／匯出、全選/清除等字典工具分頁互動皆已實作（`app/page.tsx`）
- AI 輔助編輯分頁：5 家供應商 UI、模型定價資訊、成本試算、API Key 本機儲存與遮罩顯示、匯出格式選擇（`components/AIEditor.tsx`）
- 伺服器端 5 家供應商代理呼叫與錯誤訊息金鑰遮罩（`app/api/ai-process/route.ts`），並有對應 `route.test.ts`（mock `global.fetch`，不打真實 API）
- `npm run build` 本次驗證可成功建置（Turbopack，約數秒）
- GitHub Actions 兩份部署工作流程已設定（部署到 GitHub Pages）
- README／RPD／PROJECT_SUMMARY／PROJECT_STRUCTURE／AI_EDITOR_GUIDE 等大量文件已撰寫（但部分內容已與現況不同步，見下）

---

## I. 尚待完成項目

1. ~~**AI 輔助編輯分頁在正式部署（GitHub Pages 靜態匯出）下無法運作**~~ **［2026-07-25 已修，採第二方案：前端直連］**
   - 新增 `lib/aiProviders.ts`：瀏覽器端直接呼叫五家供應商官方 API（BYOK 金鑰本來就在使用者瀏覽器，直連不新增外洩面；錯誤訊息沿用原 proxy 的金鑰遮蔽邏輯，並新增 usage 回傳讓「實際成本」顯示第一次真的可用）。
   - Anthropic 直連需帶 `anthropic-dangerous-direct-browser-access: true` header（否則被 CORS 擋下）；OpenAI／Gemini／xAI 官方 API 允許瀏覽器跨域（參考同工作區 cardforge 已實測的 client-direct 模式）；DeepSeek 的 CORS 未實測（無金鑰），若被擋會以錯誤訊息呈現而非靜默失敗。
   - `app/api/ai-process/`（route.ts + route.test.ts）已整個刪除，測試覆蓋移植到 `lib/aiProviders.test.ts`（驗證輸入檢查、五家端點路由、CORS header、金鑰遮蔽、usage 正規化）。專案回到 RPD keystone 的「純靜態、零伺服器」故事，AIEditor 上「所有 API 請求都是從您的瀏覽器直接發送至 AI 提供商」的安全文案自此為真。
   - 順帶修正 Anthropic 模型清單中不存在／已退役的 model ID（`claude-sonnet-4-5-20250514`、`claude-haiku-4-5-20250514`、`claude-3-5-*`、`claude-3-opus`）→ 改為現行有效的 `claude-sonnet-4-6`／`claude-opus-4-6`／`claude-haiku-4-5`。其他四家供應商的模型清單未逐一查證，仍可能過時（見 J-8）。
   - 驗證：`npm test` 84/84 綠；`npm run build` Route 摘要僅剩靜態頁、`out/` 無 api/；`out` 以本機 HTTP server 掛在 `/manuscript-editor` basePath 下實測首頁與全部 asset 200、bundle 內含直連端點與 CORS header、無任何 `/api/ai-process` 殘留字串（瀏覽器端點擊實測因 Chrome 擴充未連線而未做，照實記錄）。
2. **Lint 既有債務**：依 HANDOFF.md，`npm run lint` 有 13 個既有錯誤、7 個警告（`scripts/` 的 `require-imports`、`types/` 的 `any`、`HistoryPanel.tsx` 的 setState-in-effect 等），與本次交付無關但仍待清理。
3. ~~**死碼清理**~~ **［2026-07-25 已刪除］**：`components/Editor.tsx`、`FeatureToggles.tsx`、`TextAreas.tsx`、`ActionButtons.tsx`、`Statistics.tsx`、`HistoryPanel.tsx`、`DiffDisplay.tsx`、`ThemeProvider.tsx`、`lib/storageUtils.ts`（含 `storageUtils.test.ts`）已全數刪除（刪前 grep 再次確認無任何路由引用，僅死碼互相引用）。刪除後 build／test／lint 全綠；歷史記錄功能若日後要做，需重新實作。
4. **文件與程式碼不同步**：README.md／PROJECT_SUMMARY.md／PROJECT_STRUCTURE.md 記載的技術棧版本（Next 15、Tailwind 3、7 個 processor、2 個字典檔）與 `package.json`／實際程式碼（Next 16.1.1、Tailwind 4、8 個 processor、10 個字典檔中只有 3 個被實際引用）已有落差，需要一次性校對更新。
5. **字典檔案盤點**：`public/dictionaries/` 下 10 個 JSON 中，只有 3 個（`typo-dictionary.json`／`redundancy-dictionary.json`／`s2t-dictionary.json`）被 `lib/processors/*.ts` 的 `fetch` 實際引用；其餘 7 個（`valid-words.json`、`typo-corrections.json`、`typo-corrections-clean.json`、`redundancy-dictionary-expanded.json`、`dict-sample.json`、`dict-column-info.json`、`variant-characters.json`）目前用途看起來是字典產生腳本（`scripts/extract-typo-dict.js`、`scripts/parse-dict.js`）的原始或中繼資料，是否該保留在 `public/`（會被靜態部署一併發佈出去）值得重新確認。
6. **`pangu` 依賴使用狀況未確認**：`package.json` 有安裝 `pangu ^7.2.0`，但 PROJECT_SUMMARY.md 的「開發者備註」寫著「不使用 pangu，因類型問題改用自訂正則」，兩者是否矛盾、`addSpacesAroundEnglish.ts` 目前實際用哪一種實作，本次未逐行核對，待確認。
7. `.github/workflows/` 下 `deploy.yml` 與 `nextjs.yml` 兩份高度相似的部署工作流程，是否都在使用、是否該合併為一份，未確認。

---

## J. 系統優化或增加功能建議

1. ~~優先解決 I-1 的靜態匯出／API Route 衝突~~ **［2026-07-25 已解決，見 I-1］**
2. ~~若決定改為前端直連各 AI 供應商 API：可以完全移除 `app/api/ai-process/route.ts`~~ **［2026-07-25 已採納並完成］**：route 已移除，專案回到單一、一致的「純靜態、零伺服器」故事。
3. 若決定改用可跑伺服器的平台部署：可以順便把「歷史記錄」等目前只有邏輯沒有 UI 的功能重新接上，做成真正可用的功能，而不是留著測試通過但使用者摸不到的程式碼。
4. 建議在 CI（GitHub Actions）中加一個檢查步驟：build 完後檢查 `out/` 目錄是否包含所有預期會用到的路徑（例如用簡單腳本 grep 這次發現的 `ƒ Dynamic` 標記），避免類似的「build 成功但功能悄悄消失」再次不被發現地上線。
5. 清理/歸檔重複或過時的字典中繼檔案，並在 README 加一段「哪些字典檔案是真正在跑的、哪些只是原始資料」的說明，降低下一個接手者的認知負擔。
6. 統一並更新 README.md / PROJECT_SUMMARY.md / PROJECT_STRUCTURE.md 內容（技術棧版本、功能數量、架構圖），或考慮把這幾份高度重疊的文件合併為一份，減少維護時彼此漂移的風險（本次盤點已發現多處不一致）。
7. ~~移除或明確標示 `components/` 下的死碼元件~~ **［2026-07-25 已直接刪除，見 I-3］**
8. **（新增）供應商模型清單查證**：`components/AIEditor.tsx` 內寫死的 OpenAI／Gemini／xAI／DeepSeek 模型 ID 與定價未逐一向官方查證，可能已過時（Anthropic 部分已於本次修正）。建議之後對照各家官方定價頁一次性更新，或改為可設定的 JSON。
9. **（新增）DeepSeek 瀏覽器直連 CORS 未實測**：若其 API 不允許跨域，該供應商在靜態站上會顯示網路錯誤（非靜默失敗）；屆時可考慮在 UI 標註或移除該選項。

---

*本檔案為 Galley 交付規格（GALLEY_SPEC.md）要求的交付物之一，與 `docs/architecture.html` / `docs/architecture.svg` / `docs/architecture.mmd` / `mockup/` 一併產出，僅描述 manuscript-editor 專案本身，不涉及其他子專案。*
