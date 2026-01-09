# 安全性審計報告

> 審計日期：2026 年 1 月 9 日
> 審計範圍：API Key 安全、資料傳輸、本地儲存

---

## 📋 安全性審計摘要

| 項目 | 狀態 | 風險等級 |
|------|------|----------|
| API Key 儲存 | ✅ 通過 | 低 |
| 資料傳輸安全 | ✅ 通過 | 低 |
| 程式碼安全 | ✅ 通過 | 低 |
| Git 歷史安全 | ✅ 通過 | 低 |
| 部署安全 | ✅ 通過 | 低 |

**整體評分：🛡️ 安全**

---

## 1. API Key 儲存安全

### 儲存機制

- **儲存位置**：瀏覽器 `localStorage`
- **儲存格式**：`ai-editor-apikey-{provider}`
- **生命週期**：直到使用者清除瀏覽器資料

### 安全特性

| 特性 | 狀態 |
|------|------|
| 不上傳至伺服器 | ✅ |
| 不存入資料庫 | ✅ |
| 不記錄至日誌 | ✅ |
| 每個提供商獨立儲存 | ✅ |

### 程式碼驗證

```typescript
// AIEditor.tsx - localStorage 只在客戶端使用
if (typeof window !== 'undefined') {
  const savedApiKey = localStorage.getItem(`ai-editor-apikey-${apiProvider}`);
  // ...
}
```

### 清除方式

使用者可透過以下方式清除 API Key：
1. 清除 input 欄位（自動從 localStorage 刪除）
2. 清除瀏覽器資料
3. 使用開發者工具手動清除

---

## 2. 資料傳輸安全

### 部署模式分析

#### GitHub Pages 部署（純前端）

當部署至 GitHub Pages 時：
- ✅ API 請求直接從瀏覽器發送至 AI 提供商
- ✅ 不經過任何中間伺服器
- ✅ API Key 不會被第三方攔截
- ✅ 所有通訊使用 HTTPS 加密

```
使用者瀏覽器 ──HTTPS──> AI 提供商 (OpenAI/Claude/etc.)
```

#### 自託管部署（有後端）

當使用 `npm run dev` 或 Next.js 伺服器時：
- ⚠️ API 請求經過 Next.js API route
- ✅ API Key 僅在記憶體中暫存
- ✅ 錯誤訊息已清理敏感資訊
- ✅ 不記錄 API Key 至日誌

### 傳輸加密

| 環節 | 加密狀態 |
|------|----------|
| 瀏覽器 → GitHub Pages | ✅ HTTPS |
| 瀏覽器 → AI API | ✅ HTTPS |
| localStorage | ⚠️ 本地明文（瀏覽器標準行為）|

---

## 3. 程式碼安全措施

### 錯誤處理安全

API route 已實作 API Key 清理：

```typescript
// app/api/ai-process/route.ts
const sanitizedMessage = errorMessage
  .replace(/sk-[a-zA-Z0-9-_]+/g, '[REDACTED]')
  .replace(/Bearer\s+[a-zA-Z0-9-_\.]+/g, 'Bearer [REDACTED]')
  .replace(/api[_-]?key[:\s]+[a-zA-Z0-9-_]+/gi, 'api_key: [REDACTED]');
```

### XSS 防護

- ✅ React 預設 escape 所有輸出
- ✅ 未使用 `dangerouslySetInnerHTML`
- ✅ 所有使用者輸入都經過 React 處理

### CSRF 防護

- ✅ API route 只接受 POST 請求
- ✅ 使用 JSON body，不使用 form data

---

## 4. Git 歷史安全

### 已驗證項目

- ✅ `.gitignore` 包含 `.env*` 檔案
- ✅ 程式碼中無寫死的 API Key
- ✅ 無敏感資訊提交歷史

### .gitignore 內容

```
# env files (can opt-in for committing if needed)
.env*
```

---

## 5. 部署安全建議

### GitHub Pages 部署（推薦）

優點：
- 純靜態檔案，無伺服器端程式碼執行
- API Key 完全在使用者控制下
- 無資料庫，無日誌收集

### 自託管部署

如需使用 API route 功能：
- 確保使用 HTTPS
- 不記錄請求 body
- 定期更新依賴套件

---

## 6. 安全建議給使用者

### ✅ 建議做法

1. **設定 API 用量上限**
   - 在各提供商後台設定每月用量上限
   - 避免意外超額使用

2. **使用專用 API Key**
   - 為此應用建立專用 Key
   - 不要使用主帳號的 Key

3. **定期輪換 Key**
   - 建議每 3-6 個月更換
   - 發現異常立即更換

4. **監控使用量**
   - 定期檢查各提供商的使用統計
   - 開啟異常用量警報

### ❌ 避免做法

1. **不要在公用電腦使用**
   - 公用電腦可能有鍵盤記錄器
   - 使用後務必清除瀏覽器資料

2. **不要分享瀏覽器**
   - localStorage 資料可被同一瀏覽器的其他使用者讀取

3. **不要截圖 API Key**
   - 截圖可能被雲端同步
   - 避免任何形式的 Key 外洩

---

## 7. 技術實作細節

### localStorage 鍵值

| 鍵名 | 內容 |
|------|------|
| `ai-editor-apikey-openai` | OpenAI API Key |
| `ai-editor-apikey-anthropic` | Anthropic API Key |
| `ai-editor-apikey-google` | Google API Key |
| `ai-editor-apikey-xai` | xAI API Key |
| `ai-editor-apikey-deepseek` | DeepSeek API Key |
| `manuscript-editor-history` | 處理歷史記錄 |

### API 請求流程

```
1. 使用者輸入文稿
2. 從 localStorage 讀取 API Key
3. 建構請求 payload
4. 發送至 AI 提供商 API
5. 接收處理結果
6. 顯示於介面
```

**注意**：API Key 不會被快取、不會被記錄、不會被傳輸至任何非 AI 提供商的伺服器。

---

## 8. 已知限制

### localStorage 明文儲存

**情況**：localStorage 中的資料以明文儲存

**風險**：
- 同一瀏覽器的其他網站無法讀取（同源政策保護）
- 本機惡意軟體理論上可讀取

**緩解措施**：
- 這是瀏覽器標準行為
- 可選未來實作：使用 Web Crypto API 加密

### 瀏覽器擴充功能

**風險**：惡意擴充功能可能讀取 localStorage

**建議**：
- 只安裝可信任的瀏覽器擴充功能
- 考慮使用無擴充功能的瀏覽器設定檔

---

## 9. 審計結論

本應用程式已採取合理的安全措施保護使用者的 API Key：

1. **無伺服器儲存**：API Key 只存在使用者本地
2. **直接通訊**：請求直接發送至 AI 提供商
3. **錯誤清理**：敏感資訊不會出現在錯誤訊息中
4. **標準實踐**：遵循業界最佳實踐

**評定：適合公開發布至 GitHub 供他人使用。**

---

## 10. 版本歷史

| 版本 | 日期 | 審計人 | 備註 |
|------|------|--------|------|
| 1.0 | 2026-01-09 | AI Assistant | 初始審計 |

---

如有安全疑慮，請提交 Issue 至：
https://github.com/miku4ocean/manuscript-editor/issues
