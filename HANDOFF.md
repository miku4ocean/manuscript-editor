# HANDOFF — manuscript-editor
更新：2026-07-20／claude

## 目前目標
AI 文稿編輯器（簡繁轉換 + 標點修正 + LLM 潤稿），最後 commit 為補 test script（2026-07-20）。

## 狀態
- 已完成：AI 多供應商支援（OpenAI/Anthropic/Google/xAI/DeepSeek）、簡繁轉換、標點 pangu、diff 比對
- 已完成：test script（vitest，見下）
- 進行中：無（工作區乾淨）
- 驗收現況：`npm test` 88/88 通過；`npm run build` 成功；`npm run lint` 有 13 個 pre-existing 錯誤/7 警告（與本次改動無關，stash 前後比對一致，未修）

## 測試現況
- 框架：vitest 4（devDependency，未裝過任何測試框架，故新選）+ jsdom（給 localStorage 用）
- 涵蓋：lib/processors/*（7 個處理器）、lib/textProcessor.ts（orchestrator）、
  lib/diffUtils.ts、lib/exportUtils.ts、lib/storageUtils.ts、
  app/api/ai-process/route.ts（POST handler，全部 mock global.fetch，不打真實 AI API）
- 指令：`npm test`（跑一次）、`npm run test:watch`（watch 模式）
- 字典類測試直接讀 public/dictionaries/*.json 傳給 xxxSync 函式，不需 mock fetch

## 下一步（接手的人從這裡開始）
1. lint 的 13 個既有錯誤（require-imports in scripts/、any in types/、HistoryPanel.tsx 的 setState-in-effect）可挑一次性修掉
2. 之後有新功能／processor，比照現有 *.test.ts 補測試再合併

## 地雷（別踩）
- API Key 由使用者在 UI 輸入，不得改為 server-side env（會破壞多供應商設計）
- node_modules 存在但未被 git 追蹤，.gitignore 已正確設定
- app/api/ai-process/route.test.ts 用 `// @vitest-environment node`（NextRequest 在 jsdom 下行為不保證一致，其他測試維持全域 jsdom）

## 主辦權
單線／待分派
