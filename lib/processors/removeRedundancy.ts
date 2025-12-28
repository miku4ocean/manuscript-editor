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
      console.log(`  🔧 Removed duplicate: "${match}" -> "${word}"`);
      return word;
    });
  }

  // 6. Remove excessive consecutive punctuation
  result = result.replace(/，{2,}/g, '，');
  result = result.replace(/。{2,}/g, '。');
  result = result.replace(/！{2,}/g, '！');
  result = result.replace(/？{2,}/g, '？');

  // 7. Clean up multiple spaces
  result = result.replace(/\s{2,}/g, ' ');

  // 8. Remove spaces before punctuation
  result = result.replace(/\s+([，。！？；：、」』）])/g, '$1');

  // 9. Remove spaces after opening punctuation
  result = result.replace(/([「『（])\s+/g, '$1');

  return result.trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { loadRedundancyDictionary };
