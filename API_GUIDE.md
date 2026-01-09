# AI API 完整使用指南

> 最後更新：2026 年 1 月

本文件提供「文字編輯神器」AI 輔助編輯功能所支援的 API 提供商完整資訊，包括申請方式、計價說明和使用指南。

---

## 📋 目錄

1. [支援的 API 提供商](#支援的-api-提供商)
2. [計價比較表](#計價比較表)
3. [各家 API 申請教學](#各家-api-申請教學)
   - [OpenAI](#1-openai)
   - [Anthropic Claude](#2-anthropic-claude)
   - [Google Gemini](#3-google-gemini)
   - [xAI Grok](#4-xai-grok)
   - [DeepSeek](#5-deepseek)
4. [成本估算說明](#成本估算說明)
5. [安全性說明](#安全性說明)
6. [常見問題](#常見問題)

---

## 支援的 API 提供商

| 提供商 | 推薦用途 | 特色 |
|--------|----------|------|
| 🟢 **OpenAI** | 通用文字處理 | 業界標準，穩定可靠 |
| 🟠 **Anthropic Claude** | 長文、精細編輯 | 200K 超長上下文 |
| 🔵 **Google Gemini** | 日常使用 | 有免費額度 |
| ⚫ **xAI Grok** | 快速處理 | 低成本高速 |
| 🟣 **DeepSeek** | 經濟實惠 | 超低價格 |

---

## 計價比較表

### 主要模型定價 (USD 美元/每百萬 tokens)

> ⚠️ **幣值說明**：本頁所有價格均為 **美元 (USD)**，非新台幣。

| 提供商 | 模型 | 輸入價格 | 輸出價格 | 推薦指數 |
|--------|------|----------|----------|----------|
| **DeepSeek** | deepseek-chat | $0.56 | $1.68 | ⭐⭐⭐⭐⭐ 最便宜 |
| **Google** | Gemini 2.5 Flash | $0.10 | $0.40 | ⭐⭐⭐⭐⭐ 超便宜 |
| **xAI** | Grok 4 Fast | $0.20 | $0.50 | ⭐⭐⭐⭐⭐ 便宜快速 |
| **OpenAI** | GPT-4o Mini | $0.60 | $2.40 | ⭐⭐⭐⭐ 性價比高 |
| **Anthropic** | Claude 3.5 Haiku | $0.80 | $4.00 | ⭐⭐⭐⭐ 快速經濟 |
| **OpenAI** | o3-mini | $1.10 | $4.40 | ⭐⭐⭐ 推理能力強 |
| **OpenAI** | o3 | $2.00 | $8.00 | ⭐⭐⭐ 高級推理 |
| **Anthropic** | Claude 4.5 Sonnet | $3.00 | $15.00 | ⭐⭐⭐ 高品質 |
| **OpenAI** | GPT-4o | $5.00 | $20.00 | ⭐⭐ 高階模型 |
| **Anthropic** | Claude 3 Opus | $15.00 | $75.00 | ⭐ 最高品質 |
| **OpenAI** | o1 | $15.00 | $60.00 | ⭐ 頂級推理 |

### 實際成本估算範例

處理 **1,000 個中文字** 的預估成本 (USD 美元)：

| 模型 | 預估 Tokens | 預估成本 (USD) |
|------|-------------|----------|
| DeepSeek Chat | ~1,500 | ~$0.003 |
| Gemini 2.5 Flash | ~1,500 | ~$0.0008 |
| GPT-4o Mini | ~1,500 | ~$0.004 |
| Claude 3.5 Haiku | ~1,500 | ~$0.007 |
| GPT-4o | ~1,500 | ~$0.038 |

> 💡 **建議**：一般文稿處理推薦使用 **DeepSeek Chat**、**Gemini 2.5 Flash** 或 **GPT-4o Mini**，成本極低且效果良好。

---

## 各家 API 申請教學

### 1. OpenAI

#### 申請步驟

1. **前往 OpenAI Platform**
   - 網址：https://platform.openai.com/

2. **註冊/登入帳號**
   - 點擊右上角「Sign Up」
   - 可使用 Google、Microsoft 或 Email 註冊

3. **設定付款方式**
   - 前往 Settings → Billing
   - 點擊「Add payment details」
   - 輸入信用卡資訊
   - 建議設定使用量上限 (Usage limits) 避免超額

4. **創建 API Key**
   - 前往 https://platform.openai.com/api-keys
   - 點擊「Create new secret key」
   - 為 Key 命名（如：manuscript-editor）
   - **務必立即複製並保存！關閉後無法再次查看**

#### 可用模型

| 模型 ID | 說明 |
|---------|------|
| `gpt-4o` | 最新旗艦模型 |
| `gpt-4o-mini` | 經濟型選擇 ✨推薦 |
| `o3` | 推理模型 |
| `o3-mini` | 經濟型推理 |
| `o1` | 高階推理 |

#### API Key 格式
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 2. Anthropic Claude

#### 申請步驟

1. **前往 Anthropic Console**
   - 網址：https://console.anthropic.com/

2. **註冊帳號**
   - 點擊「Sign up」
   - 使用 Email 註冊並驗證

3. **設定付款方式**
   - 前往 Settings → Billing
   - 加入信用卡
   - 新帳號通常有 $5 免費額度

4. **創建 API Key**
   - 前往 https://console.anthropic.com/settings/keys
   - 點擊「Create Key」
   - 複製並保存 Key

#### 可用模型

| 模型 ID | 說明 |
|---------|------|
| `claude-sonnet-4-5-20250514` | 最新平衡型 |
| `claude-haiku-4-5-20250514` | 最快速 ✨推薦 |
| `claude-3-5-sonnet-20241022` | 穩定版 |
| `claude-3-5-haiku-20241022` | 經濟版 |
| `claude-3-opus-20240229` | 最高品質 |

#### API Key 格式
```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 3. Google Gemini

#### 申請步驟

1. **前往 Google AI Studio**
   - 網址：https://aistudio.google.com/

2. **登入 Google 帳號**
   - 使用現有 Google 帳號即可

3. **取得 API Key**
   - 前往 https://aistudio.google.com/app/apikey
   - 點擊「Create API key」
   - 選擇或建立 Google Cloud 專案
   - 複製 API Key

#### 免費額度
- Gemini 2.0 Flash 實驗版：**完全免費**（有速率限制）
- 其他模型：每日有免費額度

#### 可用模型

| 模型 ID | 說明 |
|---------|------|
| `gemini-2.5-flash` | 快速經濟 ✨推薦 |
| `gemini-2.5-pro` | 高品質 |
| `gemini-2.0-flash-exp` | 免費實驗版 |

#### API Key 格式
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### 4. xAI Grok

#### 申請步驟

1. **前往 xAI Console**
   - 網址：https://console.x.ai/

2. **註冊帳號**
   - 可使用 X (Twitter) 帳號登入
   - 或使用 Email 註冊

3. **設定付款方式**
   - 前往 Billing 設定
   - 加入付款方式

4. **創建 API Key**
   - 前往 API Keys 頁面
   - 創建新 Key

#### 可用模型

| 模型 ID | 說明 |
|---------|------|
| `grok-4-fast` | 快速經濟 ✨推薦 |
| `grok-4` | 標準版 |
| `grok-3` | 穩定版 |

#### API Key 格式
```
xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 5. DeepSeek

#### 申請步驟

1. **前往 DeepSeek Platform**
   - 網址：https://platform.deepseek.com/

2. **註冊帳號**
   - 使用 Email 或手機號註冊

3. **獲得免費額度**
   - 新用戶自動獲得 **500 萬 tokens 免費額度**
   - 無需綁定信用卡

4. **創建 API Key**
   - 前往 https://platform.deepseek.com/api_keys
   - 點擊「Create new API key」

#### 可用模型

| 模型 ID | 說明 |
|---------|------|
| `deepseek-chat` | 通用對話 ✨推薦 |
| `deepseek-reasoner` | 推理模式 |

#### API Key 格式
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 成本估算說明

### Token 計算方式

本應用程式採用以下估算規則：

| 字元類型 | 預估 Tokens |
|----------|-------------|
| 中文字 | 1.5 tokens/字 |
| 英文字母 | 0.25 tokens/字 |
| 其他符號 | 0.5 tokens/字 |

### 成本計算公式

```
總成本 = (輸入 Tokens × 輸入價格 / 1,000,000) + (輸出 Tokens × 輸出價格 / 1,000,000)
```

### 應用內成本顯示

當您輸入文字後，系統會自動計算並顯示：
- **預估輸入 Tokens**
- **預估輸出 Tokens**（假設與輸入相近）
- **預估成本**（USD 美元）
- **實際成本**（處理完成後顯示，USD 美元）

---

## 安全性說明

### 🔒 API Key 安全保障

1. **純本地儲存**
   - API Key 僅儲存在您瀏覽器的 `localStorage`
   - 不會上傳至任何伺服器

2. **直接 API 呼叫**
   - 所有請求直接從您的瀏覽器發送到 AI 提供商
   - 不經過任何中間伺服器

3. **無後端儲存**
   - 本應用為純前端靜態網站
   - 沒有資料庫，不收集任何用戶資料

4. **清除資料**
   - 清除瀏覽器資料即可刪除所有 API Key
   - 每個提供商的 Key 獨立儲存

### ⚠️ 安全建議

1. **設定 API 使用量上限**
   - 在各提供商後台設定月度上限
   - 避免意外超額使用

2. **定期更換 API Key**
   - 建議每 3-6 個月更換一次

3. **不要在公用電腦使用**
   - 避免在網咖、圖書館等公用電腦輸入 API Key

4. **監控使用量**
   - 定期查看各提供商的使用統計
   - 發現異常立即更換 Key

---

## 常見問題

### Q: 哪個 API 最便宜？

**A:** DeepSeek 和 Google Gemini Flash 是目前最便宜的選擇。DeepSeek 還提供 500 萬 tokens 免費額度。

### Q: 哪個 API 品質最好？

**A:** GPT-4o 和 Claude 3.5 Sonnet 通常被認為是品質最好的。但對於文稿處理，GPT-4o Mini 和 Claude Haiku 已經足夠好。

### Q: API Key 會被盜用嗎？

**A:** 只要您不在公用電腦使用，且不分享 Key，風險很低。API Key 僅存在您的瀏覽器本地。

### Q: 處理一篇 3000 字的文章要多少錢？

**A:** (以下皆為 USD 美元)
使用 DeepSeek：約 $0.01 USD
使用 GPT-4o Mini：約 $0.02 USD
使用 GPT-4o：約 $0.15 USD

### Q: 為什麼 API 請求失敗？

常見原因：
1. API Key 錯誤或過期
2. 帳戶餘額不足
3. 超過速率限制
4. 網路連線問題

---

## 聯絡與支援

如有問題，請在 GitHub 上提交 Issue：
https://github.com/miku4ocean/manuscript-editor/issues

---

**祝您使用愉快！** ✨
