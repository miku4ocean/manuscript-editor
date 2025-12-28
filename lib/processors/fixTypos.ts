/**
 * Feature 3: 偵測錯字並修改
 * Fix common typos based on Education Ministry dictionary
 */

import { getDictionaryPath } from '../utils/paths';

let typoDictionary: Record<string, string> = {};
let dictionaryLoaded = false;

/**
 * Load typo corrections from our curated dictionary
 * Format: { "錯字": "正確字", ... }
 */
async function loadTypoDictionary() {
  if (dictionaryLoaded) return typoDictionary;

  try {
    // Only load our manually curated dictionary (not the Education Ministry one)
    const response = await fetch(getDictionaryPath('typo-dictionary.json'));

    if (response.ok) {
      const customData: Record<string, string> = await response.json();
      Object.assign(typoDictionary, customData);
      dictionaryLoaded = true;
      console.log(`Loaded ${Object.keys(typoDictionary).length} typo corrections`);
    } else {
      console.warn('Failed to load typo dictionary');
    }
  } catch (error) {
    console.error('Error loading typo dictionary:', error);
  }

  return typoDictionary;
}

export async function fixTypos(text: string): Promise<string> {
  if (!text) return text;

  // Load dictionary if not already loaded
  const dictionary = await loadTypoDictionary();

  // If dictionary is empty, just return original text
  if (Object.keys(dictionary).length === 0) {
    console.warn('❌ Typo dictionary is empty!');
    return text;
  }

  let result = text;
  let replacementCount = 0;

  // Sort keys by length (longest first) to handle multi-character replacements
  const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);

  for (const typo of sortedKeys) {
    const correction = dictionary[typo];
    if (!correction || typo === correction) continue; // Skip invalid entries

    // Use global regex to replace all occurrences
    const regex = new RegExp(escapeRegex(typo), 'g');
    const newResult = result.replace(regex, correction);
    if (newResult !== result) {
      replacementCount++;
      console.log(`  Fixed: "${typo}" → "${correction}"`);
    }
    result = newResult;
  }

  console.log(`✅ Fix Typos: ${replacementCount} typo types fixed using ${Object.keys(dictionary).length} dictionary entries`);
  return result;
}

// Synchronous version for when dictionary is already loaded
export function fixTyposSync(text: string, dictionary?: Record<string, string>): string {
  if (!text) return text;

  const dict = dictionary || typoDictionary;
  if (Object.keys(dict).length === 0) return text;

  let result = text;
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

  for (const typo of sortedKeys) {
    const correction = dict[typo];
    const regex = new RegExp(escapeRegex(typo), 'g');
    result = result.replace(regex, correction);
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export function to preload dictionary
export { loadTypoDictionary };
