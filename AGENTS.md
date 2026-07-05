# manuscript-editor — 薄索引
跨平台規則正本：`~/.agents/institution/`（先讀 core/PRINCIPLES.md，照其指示附版本標記）。

## 專案專屬
- Build/test 指令：`npm run dev`（開發）、`npm run build`、`npm run lint`（無 test script）
- 架構一句話：Next.js 16 + React 19 全端 Web 應用，AI 輔助文稿編輯器，支援簡繁轉換（opencc-js）、標點修正（pangu）、差異比對（diff-match-patch），由使用者在前端輸入自己的 AI API Key 呼叫各大 LLM
- 本專案禁區：API Key 由使用者在 UI 輸入、不得在程式碼中硬編碼任何金鑰
