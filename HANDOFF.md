# HANDOFF — manuscript-editor
更新：2026-07-05／claude

## 目前目標
AI 文稿編輯器（簡繁轉換 + 標點修正 + LLM 潤稿），最後 commit 為字典資料庫擴充（2026-01-09）。

## 狀態
- 已完成：AI 多供應商支援（OpenAI/Anthropic/Google/xAI/DeepSeek）、簡繁轉換、標點 pangu、diff 比對
- 進行中：無（工作區乾淨）
- 驗收現況：未驗證（git ls-files 未見 .next/ 被追蹤，node_modules 存在）

## 下一步（接手的人從這裡開始）
1. 執行 `npm run lint` 確認無 ESLint 錯誤
2. 執行 `npm run build` 確認建置正常
3. 補充 test script（目前 package.json 無 test 指令）

## 地雷（別踩）
- API Key 由使用者在 UI 輸入，不得改為 server-side env（會破壞多供應商設計）
- node_modules 存在但未被 git 追蹤，.gitignore 已正確設定

## 主辦權
單線／待分派
