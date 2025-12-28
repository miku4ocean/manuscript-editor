/**
 * Feature 1: 簡體轉繁體
 * Convert Simplified Chinese to Traditional Chinese
 * Using custom dictionary for reliability in browser environment
 */

import { getDictionaryPath } from '../utils/paths';

let s2tDictionary: Record<string, string> = {};
let dictionaryLoaded = false;

async function loadS2TDictionary() {
  if (dictionaryLoaded) return s2tDictionary;

  try {
    const response = await fetch(getDictionaryPath('s2t-dictionary.json'));
    if (response.ok) {
      s2tDictionary = await response.json();
      dictionaryLoaded = true;
      console.log(`✅ Loaded ${Object.keys(s2tDictionary).length} simplified-to-traditional character mappings`);
    } else {
      console.warn('❌ Failed to load s2t dictionary');
    }
  } catch (error) {
    console.error('❌ Error loading s2t dictionary:', error);
  }

  return s2tDictionary;
}

export async function simplifiedToTraditionalAsync(text: string): Promise<string> {
  if (!text) return text;

  const dictionary = await loadS2TDictionary();
  return simplifiedToTraditional(text, dictionary);
}

export function simplifiedToTraditional(text: string, dictionary?: Record<string, string>): string {
  if (!text) return text;

  const dict = dictionary || s2tDictionary;
  if (Object.keys(dict).length === 0) {
    console.warn('⚠️ S2T dictionary not loaded, returning original text');
    return text;
  }

  // Sort dictionary keys by length (longest first) to match phrases before characters
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

  let result = text;
  let changeCount = 0;

  // Apply replacements from longest to shortest
  for (const simplified of sortedKeys) {
    const traditional = dict[simplified];
    if (!traditional || simplified === traditional) continue;

    // Use global regex to replace all occurrences
    const regex = new RegExp(escapeRegex(simplified), 'g');
    const newResult = result.replace(regex, traditional);

    if (newResult !== result) {
      // Count how many times this pattern was replaced
      const matches = result.match(regex);
      if (matches) {
        changeCount += matches.length;
        if (simplified.length > 1) {
          console.log(`  🔄 "${simplified}" → "${traditional}" (${matches.length}x)`);
        }
      }
    }

    result = newResult;
  }

  if (changeCount > 0) {
    console.log(`✅ Simplified to Traditional: converted ${changeCount} items`);
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export function to preload dictionary
export { loadS2TDictionary };
