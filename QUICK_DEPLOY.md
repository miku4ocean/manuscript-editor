# Quick Deploy Guide - 快速部署指南

## 立即部署到 GitHub Pages

### Step 1: 建立 GitHub Repository

在 GitHub 上建立新的 Repository（例如：`manuscript-editor`）

### Step 2: 推送程式碼

```bash
cd /Users/leonalin/Code/mento12/manuscript-editor

# 初始化 Git（如果尚未初始化）
git init

# 添加所有檔案
git add .

# 建立首次 commit
git commit -m "feat: Complete manuscript editor with 7 features

- Simplified to Traditional Chinese conversion
- Add spaces around English text
- Fix typos based on dictionary
- Remove redundant words
- Fix punctuation marks
- Segment paragraphs
- Remove timestamps

Includes full UI with diff highlighting, statistics, export, and history features."

# 設定 main 分支
git branch -M main

# 添加遠端 repository（請替換 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/manuscript-editor.git

# 推送到 GitHub
git push -u origin main
```

### Step 3: 啟用 GitHub Pages

1. 前往你的 GitHub Repository
2. 點擊 **Settings** 標籤
3. 左側選單選擇 **Pages**
4. 在 **Source** 下拉選單中選擇 **GitHub Actions**
5. 等待自動部署完成（約 2-3 分鐘）

### Step 4: 訪問網站

部署完成後，你的網站將在以下網址可用：

```
https://YOUR_USERNAME.github.io/manuscript-editor/
```

---

## 本地測試（部署前）

```bash
# 安裝依賴
npm install

# 建置靜態檔案
npm run build

# 預覽建置結果
npx serve out

# 訪問 http://localhost:3000
```

---

## 更新部署

每次修改後，只需：

```bash
git add .
git commit -m "描述你的修改"
git push
```

GitHub Actions 會自動重新部署。

---

## 自訂網域（可選）

如果你有自己的網域：

1. 在 Repository 的 **Settings > Pages** 中輸入你的網域
2. 在網域 DNS 設定中新增 CNAME 記錄指向 `YOUR_USERNAME.github.io`
3. 等待 DNS 生效（最多 24 小時）

---

## 疑難排解

### 問題 1: 部署失敗

**解決方法:**
- 檢查 Actions 標籤中的錯誤訊息
- 確認 `next.config.ts` 中的 `basePath` 和 `assetPrefix` 設定正確
- 確認所有檔案都已提交

### 問題 2: 頁面顯示空白

**解決方法:**
- 確認 `basePath` 設定為 `/manuscript-editor`
- 清除瀏覽器快取
- 檢查瀏覽器 Console 是否有錯誤

### 問題 3: 字典檔案載入失敗

**解決方法:**
- 確認 `public/dictionaries/` 資料夾已提交
- 檢查 `fixTypos.ts` 中的路徑設定
- 確認 GitHub Pages 已完全部署

---

## 快速指令參考

```bash
# 開發
npm run dev

# 建置
npm run build

# 推送更新
git add . && git commit -m "update" && git push

# 查看建置狀態
# 訪問 https://github.com/YOUR_USERNAME/manuscript-editor/actions
```

---

**預計部署時間**: 5 分鐘
**首次載入速度**: < 2 秒
**部署成本**: 完全免費

祝部署順利！
