# manuscript-editor — 薄索引
跨平台規則正本：`~/.agents/institution/`（先讀 core/PRINCIPLES.md，照其指示附版本標記）。

## 專案專屬
- Build/test 指令：`npm run dev`（開發）、`npm run build`、`npm run lint`、`npm test`（vitest，12 檔 84 測試）
- 架構一句話：Next.js 16.1.1 + React 19 **純靜態**（`output: 'export'`）單頁雙分頁工具——
  字典工具（8 個自寫 processor＋3 個 JSON 字典，全在瀏覽器跑）＋AI 輔助編輯
  （五家 LLM 由瀏覽器直連官方 API，使用者自備金鑰），差異比對用 diff-match-patch
- 本專案禁區：
  - API Key 由使用者在 UI 輸入、不得在程式碼中硬編碼任何金鑰
  - **不得改回 server proxy／server-side env**（靜態匯出沒有伺服器，且破壞安全文案）
  - `public/` 只放執行期真的要 fetch 的檔案（會整包發佈到 GitHub Pages）；
    腳本中繼資料一律放 `scripts/data/`
- 依賴實況：**沒有用 pangu**（已移除）、**沒有用 opencc-js**（安裝了但零 import，
  簡繁走手工 JSON 字典）。文件若與此矛盾以程式碼為準。
