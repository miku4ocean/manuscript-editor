# AI 輔助編輯器使用指南

## 🤖 功能介紹

AI 輔助編輯器是文字編輯神器的第二個分頁，使用 AI 技術幫助您處理文稿。

### 與字典工具的差異

| 特性 | 字典工具 | AI 輔助編輯 |
|------|---------|------------|
| 處理方式 | 基於預設字典規則 | AI 語意理解 |
| 準確度 | 字典內容 100% | AI 判斷約 95%+ |
| 處理速度 | 即時 | 需等待 API 回應（3-10秒） |
| 成本 | 免費 | 需要 API 費用 |
| 網路需求 | 完全離線 | 需要網路連線 |
| 適用場景 | 快速批量處理 | 複雜語意判斷 |

## 🔑 API Key 設定

### 支援的 AI 服務

#### 1. OpenAI (推薦新手使用)

**取得 API Key：**
1. 前往 https://platform.openai.com/api-keys
2. 登入或註冊帳號
3. 點擊 "Create new secret key"
4. 複製 API Key（格式：`sk-...`）

**可用模型：**
- `gpt-4o` - 最新最強（較貴）
- `gpt-4o-mini` - 推薦使用（性價比高）
- `gpt-4-turbo` - 穩定版本
- `gpt-3.5-turbo` - 最便宜

**費用參考（2025年）：**
- gpt-4o-mini: 約 $0.15 / 1M tokens（1000字約$0.0003）
- gpt-4o: 約 $2.50 / 1M input tokens

#### 2. Anthropic Claude

**取得 API Key：**
1. 前往 https://console.anthropic.com/
2. 註冊帳號
3. 在 API Keys 頁面創建新 key

**可用模型：**
- `claude-3-5-sonnet-20241022` - 最新版本（推薦）
- `claude-3-haiku-20240307` - 快速便宜

**費用參考（2025年）：**
- Claude 3 Haiku: $0.25 / 1M tokens
- Claude 3.5 Sonnet: $3.00 / 1M input tokens

#### 3. Google Gemini

**取得 API Key：**
1. 前往 https://aistudio.google.com/app/apikey
2. 登入 Google 帳號
3. 點擊 "Get API key"
4. 創建新的 API key

**可用模型：**
- `gemini-2.0-flash-exp` - 實驗版本（免費）
- `gemini-1.5-pro` - Pro 版本
- `gemini-1.5-flash` - 快速版本

**費用參考（2025年）：**
- Gemini 1.5 Flash: 免費額度後 $0.075 / 1M characters
- Gemini 1.5 Pro: 免費額度後 $1.25 / 1M characters

## 📝 功能說明

### 1. 中文簡轉繁
- 將簡體中文轉換為繁體中文（台灣用字標準）
- AI 會考慮語境選擇正確用字

### 2. 英文字偵錯
- 檢查英文拼字錯誤
- 修正動詞時態
- 在中英文間加空格（標點符號前後除外）

### 3. 修錯字贅字
- 根據語意判斷同音異字
- 刪除多餘的重複字詞
- 移除 PDF 轉檔產生的亂碼

### 4. 修標點段落
- 依語意修正標點符號
- 適當分段提升可讀性
- 統一全形/半形標點

### 5. 刪時間戳記
- 刪除影片字幕時間戳（如 `[00:00:00]`）
- 支援多種時間戳格式

## 🛡️ 安全性說明

### API Key 儲存方式

✅ **安全措施：**
- API Key 僅儲存在您的瀏覽器 localStorage
- 不會上傳到我們的伺服器
- 每次使用時從瀏覽器直接呼叫 AI API
- 可隨時在瀏覽器中清除

⚠️ **注意事項：**
- 不要在公用電腦上儲存 API Key
- 定期更換 API Key
- 如果 Key 洩漏，立即到 API 提供商平台刪除

### 清除 API Key

**方法 1：直接清空輸入框**
- 將 API Key 輸入框清空即可

**方法 2：清除瀏覽器資料**
- Chrome: 設定 → 隱私權和安全性 → 清除瀏覽資料 → 勾選「Cookie 和其他網站資料」
- Firefox: 選項 → 隱私權與安全性 → Cookie 與網站資料 → 清除資料

**方法 3：手動刪除（開發者工具）**
```javascript
localStorage.removeItem('ai-editor-apikey-openai');
localStorage.removeItem('ai-editor-apikey-anthropic');
localStorage.removeItem('ai-editor-apikey-google');
```

## 💡 使用技巧

### 建議的處理流程

1. **第一步：字典工具快速處理**
   - 使用字典工具做初步處理
   - 快速且免費
   - 處理大部分常見問題

2. **第二步：AI 精修**
   - 如果字典工具結果不滿意
   - 切換到 AI 輔助編輯分頁
   - 讓 AI 處理複雜的語意問題

### 成本優化建議

1. **選擇合適的模型**
   - 一般文稿：使用 `gpt-4o-mini` 或 `claude-3-haiku`
   - 專業文稿：使用 `gpt-4o` 或 `claude-3-5-sonnet`

2. **批量處理**
   - 累積多份文稿一起處理
   - 避免頻繁呼叫 API

3. **混合使用**
   - 先用字典工具處理
   - 只對需要的部分使用 AI

## 🔧 故障排除

### API Key 無效

**症狀：**顯示「API Key 錯誤」或「401 Unauthorized」

**解決方法：**
1. 檢查 API Key 是否正確複製（含完整格式）
2. 確認 API Key 在提供商平台仍然有效
3. 檢查帳戶餘額是否足夠

### 處理失敗

**症狀：**顯示「處理文稿時發生錯誤」

**可能原因：**
1. **網路連線問題** - 檢查網路連線
2. **文稿過長** - 單次處理建議不超過 3000 字
3. **API 配額用盡** - 檢查帳戶額度
4. **服務暫時無法使用** - 稍後再試

### 處理速度慢

**正常速度：**
- 短文稿（< 500字）：3-5 秒
- 中等文稿（500-1500字）：5-8 秒
- 長文稿（1500-3000字）：8-15 秒

**加速技巧：**
- 使用更快的模型（如 gpt-4o-mini, claude-3-haiku）
- 分段處理長文稿
- 只勾選需要的功能

## 📊 費用估算

### 範例計算（以 1000 字文稿為例）

**OpenAI gpt-4o-mini：**
- 輸入：約 1500 tokens
- 輸出：約 1500 tokens
- 費用：約 $0.0003 USD（約 NT$0.01）

**每月 100 篇文稿（各 1000 字）：**
- OpenAI gpt-4o-mini: 約 $0.03 USD（約 NT$1）
- OpenAI gpt-4o: 約 $0.5 USD（約 NT$15）
- Anthropic Claude 3 Haiku: 約 $0.05 USD（約 NT$1.5）

## 🆚 選擇哪個 AI 服務？

### 推薦選擇

**預算有限 → Google Gemini**
- 有免費額度
- gemini-2.0-flash-exp 目前免費

**性價比最高 → OpenAI GPT-4o-mini**
- 價格便宜
- 效果好
- 穩定可靠

**追求最佳品質 → Anthropic Claude 3.5 Sonnet**
- 語意理解最佳
- 中文處理優秀
- 較為昂貴

**快速處理 → Google Gemini 1.5 Flash 或 Claude 3 Haiku**
- 回應速度最快
- 適合批量處理

## 🔗 相關連結

- [OpenAI Platform](https://platform.openai.com/)
- [Anthropic Console](https://console.anthropic.com/)
- [Google AI Studio](https://aistudio.google.com/)
- [OpenAI 定價](https://openai.com/api/pricing/)
- [Anthropic 定價](https://www.anthropic.com/pricing)
- [Google Gemini 定價](https://ai.google.dev/pricing)

---

**更新日期：** 2025-12-28
**版本：** v1.1.0
