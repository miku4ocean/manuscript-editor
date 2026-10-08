/**
 * Feature 4: 刪除贅字和發語詞
 * Remove redundant words and filler words
 */

import { getDictionaryPath } from '../utils/paths';

interface RedundancyDictionary {
  fillerWords: string[];
  patterns: string[];
  redundantPhrases?: string[];
}

let redundancyDict: RedundancyDictionary = { fillerWords: [], patterns: [] };
let dictionaryLoaded = false;

async function loadRedundancyDictionary() {
  if (dictionaryLoaded) return redundancyDict;

  try {
    const response = await fetch(getDictionaryPath('redundancy-dictionary.json'));
    if (response.ok) {
      redundancyDict = await response.json();
      dictionaryLoaded = true;
    } else {
      console.warn('Failed to load redundancy dictionary');
    }
  } catch (error) {
    console.error('Error loading redundancy dictionary:', error);
  }

  return redundancyDict;
}

/**
 * ABAB 動詞重疊（研究研究、討論討論）是正常的口語／書面用法，表示「稍微…一下」，
 * 不是口誤贅字。通用「重複詞」偵測（步驟 5）遇到這些詞要放過。
 * 名詞／副詞連說（功能功能、然後然後）仍照舊壓成一個。
 */
export const ABAB_VERBS = new Set([
  '研究', '討論', '考慮', '思考', '練習', '整理', '檢查', '準備', '休息', '介紹',
  '學習', '參考', '觀察', '了解', '瞭解', '運動', '打掃', '清理', '溝通', '嘗試',
  '體驗', '欣賞', '商量', '調整', '確認', '研討', '分析', '檢討', '反省', '比較',
  '測試', '試驗', '享受', '放鬆', '收拾', '安排', '規劃', '探索', '琢磨', '斟酌',
  '打聽', '打扮', '活動', '溫習', '複習', '復習', '預習', '請教', '商討', '交流',
  '聯絡', '聯繫', '聊聊', '看看', '想想', '走走', '幫忙', '感謝', '道歉', '搜尋',
  '調查', '評估', '設計', '改進', '修改', '修正', '核對', '點評', '回想',
  '回憶', '回顧', '盤點', '梳理', '消化', '適應', '鍛鍊', '訓練', '宣傳', '參觀',
  '拜訪', '招呼', '招待', '張羅', '應付', '交代', '解釋', '說明', '分享', '理解',
]);

export async function removeRedundancy(text: string): Promise<string> {
  if (!text) return text;

  const dictionary = await loadRedundancyDictionary();
  const result = removeRedundancySync(text, dictionary);

  console.log('✅ Remove Redundancy:', {
    fillerWords: dictionary.fillerWords?.length || 0,
    patterns: dictionary.patterns?.length || 0,
    originalLength: text.length,
    resultLength: result.length,
    charactersRemoved: text.length - result.length
  });

  return result;
}

export function removeRedundancySync(
  text: string,
  dictionary?: RedundancyDictionary
): string {
  if (!text) return text;

  const dict = dictionary || redundancyDict;
  let result = text;

  // 1. Remove redundant phrases first (they are longer and should be matched first)
  if (dict.redundantPhrases && dict.redundantPhrases.length > 0) {
    for (const phrase of dict.redundantPhrases) {
      const regex = new RegExp(escapeRegex(phrase), 'g');
      result = result.replace(regex, '');
    }
  }

  // 2. Remove filler words (only at sentence beginnings, endings, or between commas)
  if (dict.fillerWords && dict.fillerWords.length > 0) {
    // Sort by length (longest first) to avoid partial matches
    const sortedFillers = [...dict.fillerWords].sort((a, b) => b.length - a.length);

    for (const filler of sortedFillers) {
      // At sentence beginning
      const startPattern = new RegExp(
        `(^|[。！？\\n])${escapeRegex(filler)}[，、]?`,
        'g'
      );
      result = result.replace(startPattern, '$1');

      // At sentence ending before punctuation
      const endPattern = new RegExp(
        `${escapeRegex(filler)}([，。！？」』]|$)`,
        'g'
      );
      result = result.replace(endPattern, '$1');

      // Standalone between commas (e.g., "，其實，" -> "，")
      const standalonePattern = new RegExp(
        `，${escapeRegex(filler)}，`,
        'g'
      );
      result = result.replace(standalonePattern, '，');
    }
  }

  // 3. Remove repeated patterns from dictionary (e.g., "的的" -> "的", "功能功能" -> "功能")
  if (dict.patterns && dict.patterns.length > 0) {
    const sortedPatterns = [...dict.patterns].sort((a, b) => b.length - a.length);
    for (const pattern of sortedPatterns) {
      const regex = new RegExp(escapeRegex(pattern), 'g');
      const replacement = pattern.substring(0, pattern.length / 2);
      result = result.replace(regex, replacement);
    }
  }

  // 4. Handle special overlapping patterns (e.g., "一下下" -> "一下")
  // These are colloquial expressions where the last character repeats
  const overlappingPatterns: Record<string, string> = {
    '一下下': '一下',
    '等一下下': '等一下',
    '看一下下': '看一下',
    '想一下下': '想一下',
    '玩一下下': '玩一下',
    '試一下下': '試一下',
    '来一下下': '來一下',
    '來一下下': '來一下',
    '做一下下': '做一下',
    '用一下下': '用一下',
  };

  for (const [overlapping, corrected] of Object.entries(overlappingPatterns)) {
    const regex = new RegExp(escapeRegex(overlapping), 'g');
    const newResult = result.replace(regex, corrected);
    if (newResult !== result) {
      console.log(`  🔧 Fixed overlapping: "${overlapping}" -> "${corrected}"`);
      result = newResult;
    }
  }

  // 5. Detect and remove repeated words/phrases
  // Pattern: 詞 空白* 詞 -> 詞
  // Match 2-8 character words that are immediately repeated (with possible spaces)
  for (let wordLen = 8; wordLen >= 2; wordLen--) {
    // Expanded Unicode range to cover all CJK characters
    const repeatedWordPattern = new RegExp(
      `([\\u4e00-\\u9fff\\u3400-\\u4dbf]{${wordLen}})\\s*\\1`,
      'g'
    );

    result = result.replace(repeatedWordPattern, (match, word) => {
      // 「一X一X」（一個一個、一步一步）是正常的疊用，不是贅字
      if (wordLen === 2 && word[0] === '一') return match;
      // ABAB 動詞重疊（研究研究、討論討論）是正常用法，不是贅字
      if (wordLen === 2 && ABAB_VERBS.has(word) && !/\s/.test(match)) return match;
      return word;
    });
  }

  // 6. Remove excessive consecutive punctuation
  result = result.replace(/，{2,}/g, '，');
  result = result.replace(/。{2,}/g, '。');
  result = result.replace(/！{2,}/g, '！');
  result = result.replace(/？{2,}/g, '？');

  // 7. Clean up multiple spaces (horizontal only — \s{2,} would also eat the
  //    \n\n paragraph separators and merge the whole manuscript into one line)
  result = result.replace(/[ \t]{2,}/g, ' ');

  // 8. Remove spaces before punctuation
  result = result.replace(/[ \t]+([，。！？；：、」』）])/g, '$1');

  // 9. Remove spaces after opening punctuation
  result = result.replace(/([「『（])[ \t]+/g, '$1');

  return result.trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { loadRedundancyDictionary };
