# Manuscript Editor - RPD Document (FINAL VERSION)
## Requirements, Planning, Design

---

## 1. Requirements (需求分析)

### 1.1 Project Overview
開發一個專業的文稿初稿審查工具，提供多種自動化編輯功能，幫助使用者快速優化中文文稿品質。**純靜態網站，部署於 GitHub Pages，所有處理皆在客戶端執行。**

### 1.2 Target Users
- 內容創作者
- 編輯人員
- 文字工作者
- 需要處理繁體中文文稿的使用者
- 影片字幕編輯者（需要清除時間戳記）

### 1.3 Core Features (核心功能)

#### Feature 1: 簡體轉繁體
- **Description**: 將簡體中文文字轉換為繁體中文
- **Technology**: 使用 opencc-js 轉換庫
- **Implementation**: Client-side conversion using OpenCC
- **Edge Cases**:
  - 處理混合文本（中英文混合）
  - 保留原有的標點符號
  - 處理異體字選擇（使用台灣標準）

#### Feature 2: 英文字前後加空白
- **Description**: 自動在中文與英文字之間添加空格（盤古之白）
- **Technology**: 使用 pangu.js 或自訂 regex
- **Rules**:
  - 中文字 + 英文 → 中文字 + 空格 + 英文
  - 英文 + 中文字 → 英文 + 空格 + 中文字
  - 中文字 + 數字 → 中文字 + 空格 + 數字
  - 數字 + 中文字 → 數字 + 空格 + 中文字
- **Edge Cases**:
  - 避免在已有空格的地方重複添加
  - 處理標點符號前後的情況
  - 保留連結和特殊格式

#### Feature 3: 偵測錯字並修改
- **Description**: 偵測並修正常見的錯別字
- **Implementation**: 基於字典對照表的規則引擎
- **Data Source**: 用戶提供的錯字對照字典（JSON 格式）
- **Dictionary Structure**:
  ```json
  {
    "錯字": "正字",
    "在在": "再再",
    "佈局": "布局"
  }
  ```
- **Edge Cases**:
  - 避免修改專有名詞
  - 保留原有的大小寫（英文）
  - 支援多字詞替換

#### Feature 4: 刪除贅字和發語詞
- **Description**: 根據規則刪除不必要的冗詞和發語詞
- **Implementation**: 規則引擎 + 用戶提供的贅字列表
- **Common Targets**:
  - 重複的「的」（如：「我的的」→「我的」）
  - 發語詞：「然後」、「那麼」、「嗯」、「呃」
  - 口語贅字：「就是說」、「其實」、「基本上」
- **Rules**:
  - 句首發語詞刪除
  - 連續重複詞彙去重
  - 語氣助詞精簡（保留必要的）
- **User Dictionary**: 支援自訂贅字列表

#### Feature 5: 修正標點符號
- **Description**: 根據規則修正標點符號使用
- **Implementation**: 規則引擎
- **Rules**:
  - **全形/半形統一**：
    - 中文句子使用全形標點：，。！？；：「」『』
    - 英文句子使用半形標點：,.!?;:""''
  - **配對檢查**：
    - 引號配對：「」『』""''
    - 括號配對：（）[]{}
  - **標點位置**：
    - 句號、逗號前不加空格
    - 消除多餘空格
  - **常見錯誤修正**：
    - ,, → ，
    - .. → 。
    - !! → ！
    - ?? → ？
- **Edge Cases**:
  - 保留程式碼區塊的標點
  - 保留連結中的標點

#### Feature 6: 語義分段
- **Description**: 根據規則進行智能分段
- **Implementation**: 規則引擎（不使用 AI）
- **Rules**:
  - 連續兩個以上換行 → 保留一個空行
  - 句號後若無換行 → 根據長度決定是否換行
  - 段落長度超過 N 個字（可設定）→ 在句號處換行
  - 對話內容（「」包圍）→ 獨立成段
- **Parameters**:
  - 最大段落長度：200 字（可調整）
  - 最小段落長度：50 字（可調整）

#### Feature 7: 刪除時間戳記 (NEW)
- **Description**: 偵測並刪除常見的時間戳記格式
- **Implementation**: Regex pattern matching
- **Supported Formats**:
  - `[HH:MM:SS]` → `[00:12:34]`
  - `[MM:SS]` → `[12:34]`
  - `(HH:MM:SS)` → `(00:12:34)`
  - `(MM:SS)` → `(12:34)`
  - `HH:MM:SS.mmm` → `00:12:34.567`
  - `HH:MM:SS` → `00:12:34`
  - `MM:SS` → `12:34`
  - `<HH:MM:SS>` → `<00:12:34>`
- **Rules**:
  - 移除時間戳記本身
  - 移除時間戳記前後的多餘空白
  - 保留句子結構的完整性
- **Edge Cases**:
  - 避免刪除非時間戳記的數字（如：電話號碼）
  - 保留時間表達（如：「下午 3:30 見面」）

### 1.4 Additional Features (額外功能)

#### 1. 匯出功能
- 下載處理後的文字為 .txt 檔案
- 檔案名稱格式：`manuscript_edited_YYYYMMDD_HHMMSS.txt`
- 使用 Blob API 和 download attribute

#### 2. 複製功能
- 一鍵複製處理後的文字到剪貼簿
- 使用 Clipboard API
- 顯示複製成功的提示訊息

#### 3. 歷史記錄
- 使用 LocalStorage 儲存最近處理的文稿
- 儲存上限：最近 10 筆
- 顯示歷史清單，可快速載入
- 可清除歷史記錄

#### 4. 統計資訊
- 顯示變更統計：
  - 新增字數
  - 刪除字數
  - 修改處數
- 顯示文字統計：
  - 原始字數 / 處理後字數
  - 處理時間

### 1.5 Non-Functional Requirements

#### Performance
- 處理 10,000 字以內的文稿應在 3 秒內完成
- UI 響應時間 < 100ms
- 使用 Web Worker 處理大量文字（未來優化）

#### Compatibility
- 支援現代瀏覽器（Chrome, Firefox, Safari, Edge）
- 響應式設計，支援桌面、平板、手機
- 無需伺服器，完全靜態

#### Deployment
- 部署到 GitHub Pages
- 純靜態 HTML/CSS/JS
- 使用 Next.js 靜態輸出（`output: 'export'`）

---

## 2. Planning (規劃)

### 2.1 Technology Stack

#### Frontend Framework
- **Next.js 15** (App Router, Static Export)
- **React 19**
- **TypeScript**

#### Styling
- **Tailwind CSS**
- Custom CSS for diff highlighting

#### Text Processing Libraries
- **opencc-js** (v1.1.1+): 簡繁轉換
- **pangu** (v4.0.7+): 中英文空格處理
- Custom regex rules: 其他所有功能

#### Diff Visualization
- **diff-match-patch**: 文本差異計算
- Custom highlight component: 視覺化差異

#### Storage
- **LocalStorage API**: 歷史記錄
- **Clipboard API**: 複製功能
- **Blob API**: 檔案下載

### 2.2 Project Structure

```
manuscript-editor/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main editor page (client component)
│   ├── globals.css             # Global styles + Tailwind
│   └── favicon.ico
├── components/
│   ├── Editor.tsx              # Main editor component
│   ├── FeatureToggles.tsx      # 7 feature checkboxes
│   ├── TextAreas.tsx           # Before/After text areas
│   ├── DiffDisplay.tsx         # Highlighted diff display
│   ├── ActionButtons.tsx       # Process/Export/Copy buttons
│   ├── Statistics.tsx          # Change statistics display
│   └── HistoryPanel.tsx        # History sidebar
├── lib/
│   ├── processors/
│   │   ├── simplifiedToTraditional.ts    # Feature 1
│   │   ├── addSpacesAroundEnglish.ts     # Feature 2
│   │   ├── fixTypos.ts                   # Feature 3
│   │   ├── removeRedundancy.ts           # Feature 4
│   │   ├── fixPunctuation.ts             # Feature 5
│   │   ├── segmentParagraphs.ts          # Feature 6
│   │   └── removeTimestamps.ts           # Feature 7
│   ├── textProcessor.ts        # Main processor orchestrator
│   ├── diffUtils.ts            # Diff calculation utilities
│   ├── storageUtils.ts         # LocalStorage utilities
│   ├── exportUtils.ts          # Export/Copy utilities
│   └── utils.ts                # General utilities
├── public/
│   └── dictionaries/
│       ├── typo-dictionary.json         # 錯字對照表
│       └── redundancy-dictionary.json   # 贅字列表
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions for deployment
├── next.config.mjs             # Next.js config (output: 'export')
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json
├── .gitignore
└── README.md                   # 完整使用說明
```

### 2.3 Development Phases

#### Phase 1: Project Initialization (30 mins)
- [x] Create Next.js project with TypeScript
- [x] Install dependencies (opencc-js, pangu, diff-match-patch)
- [x] Configure Tailwind CSS
- [x] Set up static export in next.config.mjs
- [x] Create basic project structure

#### Phase 2: Core Processing Logic (3 hours)
- [x] Implement Feature 1: Simplified to Traditional
- [x] Implement Feature 2: Add spaces around English
- [x] Implement Feature 3: Fix typos (with dictionary)
- [x] Implement Feature 4: Remove redundancy
- [x] Implement Feature 5: Fix punctuation
- [x] Implement Feature 6: Segment paragraphs
- [x] Implement Feature 7: Remove timestamps
- [x] Create main processor orchestrator

#### Phase 3: UI Implementation (3 hours)
- [x] Build main layout
- [x] Create FeatureToggles component (7 checkboxes)
- [x] Create TextAreas component (Before/After)
- [x] Create ActionButtons component
- [x] Add responsive design

#### Phase 4: Diff Visualization (2 hours)
- [x] Implement diff calculation
- [x] Create DiffDisplay component
- [x] Color-code changes (green/red/yellow)
- [x] Add hover tooltips

#### Phase 5: Additional Features (2 hours)
- [x] Implement Statistics component
- [x] Implement Export functionality
- [x] Implement Copy to clipboard
- [x] Implement History panel with LocalStorage

#### Phase 6: Testing & Polish (2 hours)
- [x] Test all 7 features
- [x] Test on different browsers
- [x] Responsive design testing
- [x] Error handling
- [x] Performance optimization

#### Phase 7: Deployment Setup (1 hour)
- [x] Configure GitHub Actions workflow
- [x] Test static export build
- [x] Write comprehensive README
- [x] Add usage examples

**Total Estimated Time**: 13-14 hours

### 2.4 Implementation Strategy

#### Pure Client-Side Processing
- All 7 features implemented with regex and rule engines
- No API calls required
- Works completely offline after initial load
- Dictionary files loaded as static JSON

#### Dictionary Management
- User can provide custom dictionaries via JSON files
- Default dictionaries included in `/public/dictionaries/`
- Future: UI for dictionary management

---

## 3. Design (設計)

### 3.1 UI Layout (Updated)

```
┌──────────────────────────────────────────────────────────────────┐
│  📝 Manuscript Editor                                    [GitHub] │
├──────────────────────────────────────────────────────────────────┤
│  功能選擇：                                                       │
│  ☑ 簡體轉繁體  ☑ 英文加空白  ☑ 修正錯字  ☑ 刪除贅字               │
│  ☑ 修正標點    ☑ 語義分段    ☑ 刪除時間戳記                       │
│                                                                  │
│  [全選] [清除]                    [處理文稿] [匯出] [複製]         │
├────────────────────────┬─────────────────────────────────────────┤
│                        │                                         │
│  原始文稿 (Before)      │  處理後文稿 (After)                      │
│  ─────────────────     │  ─────────────────                      │
│                        │                                         │
│  [Text Input Area]     │  [Highlighted Diff Display]            │
│                        │                                         │
│  共 1,234 字           │  共 1,180 字                            │
│                        │                                         │
│  [載入歷史記錄 ▼]       │                                         │
│                        │                                         │
└────────────────────────┴─────────────────────────────────────────┘
│  統計：新增 12 處 | 刪除 66 處 | 修改 34 處 | 處理時間 0.5s       │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Color Scheme

#### Highlight Colors
- **新增 (Addition)**: `bg-green-200 text-green-900` (淺綠底，深綠字)
- **刪除 (Deletion)**: `bg-red-200 text-red-900 line-through` (淺紅底，深紅字，刪除線)
- **修改 (Modification)**: `bg-yellow-200 text-yellow-900` (淺黃底，深黃字)

#### UI Colors
- Primary Button: `bg-blue-600 hover:bg-blue-700`
- Secondary Button: `bg-gray-200 hover:bg-gray-300`
- Background: `bg-gray-50`
- Border: `border-gray-300`
- Text: `text-gray-900`

### 3.3 Component Specifications

#### Editor Component (Main)
```typescript
interface EditorState {
  originalText: string;
  processedText: string;
  enabledFeatures: Set<FeatureType>;
  isProcessing: boolean;
  statistics: Statistics;
  history: HistoryItem[];
}
```

#### FeatureToggles Component
```typescript
interface Feature {
  id: FeatureType;
  label: string;
  description: string;
  enabled: boolean;
}

const features: Feature[] = [
  { id: 'simplified-to-traditional', label: '簡體轉繁體', ... },
  { id: 'add-spaces', label: '英文加空白', ... },
  { id: 'fix-typos', label: '修正錯字', ... },
  { id: 'remove-redundancy', label: '刪除贅字', ... },
  { id: 'fix-punctuation', label: '修正標點', ... },
  { id: 'segment-paragraphs', label: '語義分段', ... },
  { id: 'remove-timestamps', label: '刪除時間戳記', ... },
];
```

#### DiffDisplay Component
```typescript
interface DiffSegment {
  type: 'equal' | 'insert' | 'delete' | 'replace';
  text: string;
}

function DiffDisplay({ segments }: { segments: DiffSegment[] }) {
  // Render highlighted text based on diff segments
}
```

### 3.4 User Interactions

#### Basic Flow
1. User pastes text into left pane (Before)
2. User selects desired features (checkboxes)
3. User clicks "處理文稿" button
4. Processing indicator shows
5. Right pane displays processed text with color highlights
6. Statistics bar shows summary of changes

#### Advanced Interactions
- **Export**: Download processed text as .txt file
- **Copy**: Copy processed text to clipboard (shows success toast)
- **History**: Select from dropdown to load previous texts
- **Select All/Clear**: Quick toggle all features
- **Hover on highlighted text**: Show tooltip with change type

### 3.5 Responsive Design

#### Desktop (>1024px)
- Side-by-side layout
- Full feature toggles on one row
- Statistics bar at bottom

#### Tablet (768-1023px)
- Side-by-side with reduced padding
- Feature toggles may wrap to two rows

#### Mobile (<768px)
- Stacked layout (vertical)
- Before text area on top
- Action buttons in middle
- After text area below
- Sticky header with feature toggles

---

## 4. Technical Decisions

### 4.1 Why Static Export?
- **GitHub Pages Requirement**: Free hosting, no server needed
- **Performance**: Pre-rendered HTML, instant load
- **Reliability**: No server downtime, works offline
- **Simplicity**: Easy deployment via GitHub Actions

### 4.2 Why Rule-Based Processing?
- **No API Costs**: Completely free to use
- **Privacy**: All processing happens locally
- **Speed**: Instant processing, no network latency
- **Offline**: Works without internet connection
- **Trade-off**: Lower accuracy than AI, but acceptable for most cases

### 4.3 Data Storage Strategy
- **Dictionaries**: Static JSON files in `/public/dictionaries/`
- **History**: LocalStorage (limit: 10 items, ~5MB total)
- **No Backend**: No database, no authentication needed

### 4.4 Deployment Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Build static export (npm run build)
      - Deploy to gh-pages branch
```

---

## 5. Success Metrics

### Functionality
- [x] All 7 features work correctly
- [x] Diff highlighting is accurate and clear
- [x] Processing time < 3 seconds for 10,000 characters
- [x] Export/Copy/History features functional

### User Experience
- [x] Intuitive UI requiring no instructions
- [x] Clear visual feedback for all actions
- [x] Responsive design works on all devices
- [x] Graceful error handling

### Code Quality
- [x] TypeScript with minimal `any` types
- [x] Component reusability
- [x] Comprehensive error handling
- [x] Clean, documented code

### Documentation
- [x] README with clear setup instructions
- [x] Usage examples with screenshots
- [x] Deployment guide
- [x] Dictionary customization guide

---

## 6. Dictionary Specifications

### Typo Dictionary (`typo-dictionary.json`)
```json
{
  "在在": "再再",
  "佈局": "布局",
  "製作": "制作",
  "反應": "反应",
  "份內": "分內"
}
```

### Redundancy Dictionary (`redundancy-dictionary.json`)
```json
{
  "fillerWords": [
    "然後", "那麼", "嗯", "呃", "啊",
    "就是說", "其實", "基本上", "老實說"
  ],
  "patterns": [
    "的的",
    "了了",
    "呢呢"
  ]
}
```

---

## 7. Future Enhancements (Post-MVP)

- AI-powered semantic analysis (optional paid feature)
- Custom dictionary editor UI
- Batch file processing
- Browser extension version
- Export to multiple formats (DOCX, PDF)
- Customizable processing rules
- Keyboard shortcuts
- Dark mode
- Multi-language support

---

## 8. Client Decisions (CONFIRMED)

✅ **AI Integration**: No - Pure rule engine, user provides dictionaries
✅ **Deployment**: GitHub Pages - Static export
✅ **Features**: 7 core features (added timestamp removal)
✅ **Additional Features**: Export, Copy, History, Statistics - All implemented
✅ **Priority**: All features equal priority

---

**Status: APPROVED - Ready for Development**
