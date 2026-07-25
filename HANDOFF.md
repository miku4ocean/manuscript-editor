# HANDOFF — manuscript-editor
更新：2026-07-25／claude

## 目前目標
AI 文稿編輯器（簡繁轉換 + 標點修正 + LLM 潤稿）。本輪修復「靜態匯出下 AI 分頁 404」部署 bug：AI 分頁改為瀏覽器直連各供應商官方 API，`app/api/` 已整個移除，專案回到 RPD 的「純靜態、GitHub Pages」keystone。

## 狀態
- 已完成：AI 多供應商支援改為 client-direct（`lib/aiProviders.ts`，OpenAI/Anthropic/Google/xAI/DeepSeek）、簡繁轉換、標點 pangu、diff 比對
- 已完成：死碼清理（Editor/FeatureToggles/TextAreas/ActionButtons/Statistics/HistoryPanel/DiffDisplay/ThemeProvider/storageUtils 已刪，grep 確認無人引用）
- 已完成：Anthropic 模型清單修正為現行有效 ID（sonnet-4-6／opus-4-6／haiku-4-5）
- 驗收現況：`npm test` 84/84 通過；`npm run build` 成功且 Route 摘要只剩靜態頁（無 `ƒ` Dynamic）；`npm run lint` 剩 12 個 pre-existing 錯誤/5 警告（scripts/ require-imports、types/ any 等，與本次改動無關）
- **未 commit**：本輪所有改動皆在工作區，等使用者確認後再 commit

## 測試現況
- 框架：vitest 4 + jsdom
- 涵蓋：lib/processors/*（7 個處理器）、lib/textProcessor.ts、lib/diffUtils.ts、lib/exportUtils.ts、
  lib/aiProviders.ts（client-direct 五家路由、CORS header、金鑰遮蔽、usage 正規化，mock global.fetch）
- 指令：`npm test`／`npm run test:watch`
- 已刪：app/api/ai-process/route.test.ts（覆蓋移植到 lib/aiProviders.test.ts）、lib/storageUtils.test.ts（隨死碼刪除）

## 下一步（接手的人從這裡開始）
1. 部署到 GitHub Pages 後，用真金鑰實測各供應商直連（特別是 DeepSeek——其 CORS 未實測；Anthropic 需 `anthropic-dangerous-direct-browser-access: true` header，已內建）
2. OpenAI/Gemini/xAI/DeepSeek 的模型清單與定價未逐一查證，可能過時（見 progress.md J-8）
3. lint 的 12 個既有錯誤（scripts/ require-imports、types/ any 等）可挑一次性修掉

## 地雷（別踩）
- API Key 由使用者在 UI 輸入、瀏覽器直連供應商，**不得改回 server proxy 或 server-side env**（靜態匯出沒有伺服器，且會破壞「金鑰不經第三方」的安全文案）
- Anthropic 直連的 `anthropic-dangerous-direct-browser-access: true` header 不能拿掉，否則被 CORS 擋下
- node_modules 存在但未被 git 追蹤，.gitignore 已正確設定

## 主辦權
單線／待分派
