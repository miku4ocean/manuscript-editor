# HANDOFF — manuscript-editor
更新：2026-07-29／claude

## 目前目標
AI 文稿編輯器（簡繁轉換 + 標點修正 + LLM 潤稿）。前一輪修復「靜態匯出下 AI 分頁 404」部署 bug：AI 分頁改為瀏覽器直連各供應商官方 API，`app/api/` 已整個移除，專案回到 RPD 的「純靜態、GitHub Pages」keystone。本輪（2026-07-29）做技術債清理與文件對帳。

## 狀態
- 已完成：AI 多供應商支援改為 client-direct（`lib/aiProviders.ts`，OpenAI/Anthropic/Google/xAI/DeepSeek）、簡繁轉換、標點修正、diff 比對
- 已完成：死碼清理（Editor/FeatureToggles/TextAreas/ActionButtons/Statistics/HistoryPanel/DiffDisplay/ThemeProvider/storageUtils 已刪，grep 確認無人引用）
- 已完成：Anthropic 模型清單修正為現行有效 ID（sonnet-4-6／opus-4-6／haiku-4-5）
- **本輪（2026-07-29）完成**：
  - lint **0 error 0 warning**（4 個 warning 全以修程式碼方式清掉，未用 disable）
  - 修真 bug：`scripts/*.js` 前一輪 require→import 後缺 ESM `__dirname`，一寫檔就炸；
    已改名 `.mjs` 並補 `fileURLToPath` 推導，兩支腳本重跑完整通過
  - `public/dictionaries` 10 檔 → **3 檔**（7 個腳本中繼資料移到 `scripts/data/`），
    `out/` 由 4.3 MB 降到 1.4 MB
  - 移除 `pangu` 依賴（全專案零 import，實作一直是自訂正則）
  - 刪除 `.github/workflows/deploy.yml`（無效 YAML，自 2026-01 起每次 push 0 秒失敗、從未部署過；
    `nextjs.yml` 才是真正在跑的那份）
  - README／PROJECT_SUMMARY／PROJECT_STRUCTURE／AGENTS 版本落差一次性校對
- 驗收現況（2026-07-29 實測）：`npm test` 12 檔 84 測試全過；`npm run build` 成功、Route 摘要只剩 `○ /` 與 `○ /_not-found`；`npm run lint` 0/0；`out/` 本機掛在 `/manuscript-editor` basePath 下 16 個 asset 全 200，移出的 7 個字典全 404

## 測試現況
- 框架：vitest 4 + jsdom
- 涵蓋：lib/processors/*（8 個處理器）、lib/textProcessor.ts、lib/diffUtils.ts、lib/exportUtils.ts、
  lib/aiProviders.ts（client-direct 五家路由、CORS header、金鑰遮蔽、usage 正規化，mock global.fetch）
- 指令：`npm test`／`npm run test:watch`
- 已刪：app/api/ai-process/route.test.ts（覆蓋移植到 lib/aiProviders.test.ts）、lib/storageUtils.test.ts（隨死碼刪除）
- 另有兩支手動冒煙腳本（非 npm test）：`node test-functions.mjs`（檔案完整性，現 32/33 通過）、
  `node test-dictionaries-simple.mjs`（字典抽測，4/4 通過）

## 下一步（接手的人從這裡開始）
1. **簡繁字典覆蓋率不足是目前最實質的缺口**：`s2t-dictionary.json` 抽查 60 個常見簡體字缺 12 個
   （汉习经济馆儿马鸟鱼车轮译），「汉语」不會被轉成「漢語」。`test-functions.mjs` 的 `S2T-汉`
   是刻意留紅的真實訊號。建議改接已在 dependencies 但零 import 的 `opencc-js` 一次解決。
2. 部署到 GitHub Pages 後，用真金鑰實測各供應商直連（特別是 DeepSeek——其 CORS 未實測；Anthropic 需 `anthropic-dangerous-direct-browser-access: true` header，已內建）
3. OpenAI/Gemini/xAI/DeepSeek 的模型清單與定價未逐一查證，可能過時（見 progress.md J-8）
4. `opencc-js`／`@material-tailwind/react`／`react-icons` 三個依賴零 import，去留待使用者決定
   （見 progress.md I-9；`opencc-js` 建議先留著給第 1 項用）

## 地雷（別踩）
- API Key 由使用者在 UI 輸入、瀏覽器直連供應商，**不得改回 server proxy 或 server-side env**（靜態匯出沒有伺服器，且會破壞「金鑰不經第三方」的安全文案）
- Anthropic 直連的 `anthropic-dangerous-direct-browser-access: true` header 不能拿掉，否則被 CORS 擋下
- **`public/` 會被 `output: 'export'` 整包發佈到 GitHub Pages**——只放執行期真的要 fetch 的檔案。
  字典腳本的原始／中繼資料一律放 `scripts/data/`，不要放回 `public/dictionaries/`
  （`test-functions.mjs` 的 `DICT-no-stray` 會抓）
- 本機預覽 `out/` 要掛在 `/manuscript-editor` basePath 下，直接 `npx serve out` 會全部 404
- node_modules 存在但未被 git 追蹤，.gitignore 已正確設定

## 主辦權
單線／待分派
