# HANDOFF — manuscript-editor
更新：2026-08-03／claude（簡繁轉換改接 opencc-js）

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

## 2026-08-03／claude(簡繁字典換成 opencc-js —— 下一步 1 的最實質缺口已解)

本檔下一步 1 記「簡繁字典覆蓋率不足是目前最實質的缺口…建議改接已在 dependencies 但零 import 的
`opencc-js` 一次解決」,並說 `test-functions.mjs` 的 `S2T-汉` 是**刻意留紅的真實訊號**。本輪照做。

**先量化舊字典有多不可靠**(不是憑感覺換掉):把 8263 條逐條餵給 opencc(`cn`→`twp`)比對——
7563 條一致、**700 條不一致**,而不一致處多半是手工字典錯。實測到兩類真錯誤:
- **缺字**:`汉` 根本不在字典裡,「汉语很难」轉出來是「汉語很難」(就是那條紅測試)。
- **單字對應到整個詞**:`库→函式庫` 讓「这个库很好用」變成「這個**函式庫**很好用」;
  `类→類別` 讓「分类」變「分類別」;`分布→分散對齊` 更是離譜。

**新架構是兩層**:
1. **opencc-js(`cn`→`twp`)為基底**——字元與常見詞彙靠它,帶詞組上下文。選 `twp` 而非 `tw`
   是因為舊字典本來就做台灣用語轉換(鼠标→滑鼠、程序→程式、信息→資訊),`twp` 才符合既定語義。
2. **`s2t-overlay.json` 為覆蓋層(165 條)**——opencc 不涵蓋的台灣軟體/設計術語
   (IP位址、收件匣、遮色片、範本、巨集…)。由舊字典自動篩出:只留「opencc 轉不動 **且** 多字」的條目。

**覆蓋層刻意排除全部 9 條單字**(制→製、注→註、周→週、列→欄、堆→堆積、宏、米、松、咽)。
實測若照套會產生:制度→**製**度、注意→**註**意、周圍→**週**圍、列車→**欄**車、堆疊→堆**積**疊,全是誤譯。
單字歧義本來就要靠上下文,那正是 opencc 的強項。

**過程中又抓到一個既有 bug**:原本的取代演算法是「逐條 split/join 跑一輪」,
前面替換出來的結果會被後面的鍵再打一次。實際資料就中招——
`皮筋→橡皮筋` 換完後 `橡皮→橡皮擦` 又命中,最後吐出「**橡皮擦筋**」。
已改成把所有鍵組成 alternation 的**單次掃描**,每個位置只會被替換一次。

**體積**:opencc-js 會把字典打包進來(最大 chunk 1.1MB),所以用**動態 import** 延遲載入。
已驗證 `out/index.html` 不引用該 chunk(grep 計數 0),不拖累首屏——與原本「用到才 fetch 字典」的行為一致。

**測試**:`simplifiedToTraditional.test.ts` 重寫成測**真正的管線**(opencc + 覆蓋層,不 mock),
5 → 18 項;`test-functions.mjs` 的 Test 4 改成「單字問 opencc、術語查覆蓋層」兩段驗,
並新增「覆蓋層不得含單字條目」的不變條件。
**已反證兩條**:(A) 把 `列→欄`、`注→註` 放回覆蓋層 → 2 條紅;
(B) 把單次掃描改回逐條 split/join → 2 條紅。還原後皆綠。

**檔案異動**:`public/dictionaries/s2t-dictionary.json` 已移除(被 opencc + 覆蓋層取代);
四處引用(`test-functions.mjs`／`test-dictionaries-simple.mjs`／`lib/test-dictionaries.ts`／
處理器本身)同步改指覆蓋層。移除當下 `DICT-no-stray` 這條既有不變條件測試立刻抓到殘留檔,
是它提醒我要清乾淨的。

驗收(2026-08-03 實跑):`node test-functions.mjs` **通過率 100%**(原 97.0%,那條 `S2T-汉` 現在
是真的過而不是被刪掉)、`npm test` 84 → **95 全綠**、`npm run lint` 乾淨、`npm run build` 成功、
`node test-dictionaries-simple.mjs` PASS。
**未做**:瀏覽器實機轉換未目視(屬人工項);`opencc-js` 現在真的有被 import 了,
所以下一步 4「零 import 依賴」的清單少一個,剩 `@material-tailwind/react`／`react-icons`。

## 下一步（接手的人從這裡開始）
1. ~~簡繁字典覆蓋率不足~~ **已於 2026-08-03 改接 opencc-js 解決**（見同日條目）：
   字元轉換交給 opencc（`cn`→`twp`），另留 165 條術語覆蓋層；`S2T-汉` 已真正轉綠，
   順帶修掉「單字被換成整個詞」與「替換結果被二次替換」兩個既有 bug。
2. 部署到 GitHub Pages 後，用真金鑰實測各供應商直連（特別是 DeepSeek——其 CORS 未實測；Anthropic 需 `anthropic-dangerous-direct-browser-access: true` header，已內建）
3. OpenAI/Gemini/xAI/DeepSeek 的模型清單與定價未逐一查證，可能過時（見 progress.md J-8）
4. `@material-tailwind/react`／`react-icons` 兩個依賴零 import，去留待使用者決定
   （見 progress.md I-9）。~~`opencc-js`~~ 已於 2026-08-03 正式接上，不再是零 import。

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
