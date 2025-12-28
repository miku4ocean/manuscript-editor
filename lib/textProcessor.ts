/**
 * Main Text Processor Orchestrator
 * Coordinates all text processing features
 */

import { simplifiedToTraditionalAsync, loadS2TDictionary } from './processors/simplifiedToTraditional';
import { addSpacesAroundEnglish } from './processors/addSpacesAroundEnglish';
import { fixTypos, loadTypoDictionary } from './processors/fixTypos';
import {
  removeRedundancy,
  loadRedundancyDictionary,
} from './processors/removeRedundancy';
import { fixPunctuation } from './processors/fixPunctuation';
import { segmentParagraphs } from './processors/segmentParagraphs';
import { removeTimestamps } from './processors/removeTimestamps';
import { removeUnnecessarySpaces } from './processors/removeSpaces';

export type FeatureType =
  | 'simplified-to-traditional'
  | 'add-spaces'
  | 'fix-typos'
  | 'remove-redundancy'
  | 'fix-punctuation'
  | 'segment-paragraphs'
  | 'remove-timestamps';

export interface ProcessingOptions {
  enabledFeatures: Set<FeatureType>;
}

export interface ProcessingResult {
  text: string;
  processingTime: number;
}

/**
 * Process text with selected features
 */
export async function processText(
  text: string,
  options: ProcessingOptions
): Promise<ProcessingResult> {
  const startTime = performance.now();

  let result = text;

  // Process features in a specific order for best results
  const { enabledFeatures } = options;

  try {
    // 1. Remove timestamps FIRST (if enabled)
    if (enabledFeatures.has('remove-timestamps')) {
      result = removeTimestamps(result);
    }

    // 2. Remove unnecessary spaces only if any text processing is enabled
    // This prevents removing intentional spaces in the original text
    if (enabledFeatures.size > 0 &&
        (enabledFeatures.has('fix-typos') ||
         enabledFeatures.has('remove-redundancy') ||
         enabledFeatures.has('simplified-to-traditional'))) {
      result = removeUnnecessarySpaces(result);
    }

    // 3. Convert simplified to traditional (if enabled)
    if (enabledFeatures.has('simplified-to-traditional')) {
      result = await simplifiedToTraditionalAsync(result);
    }

    // 4. Fix typos (if enabled)
    if (enabledFeatures.has('fix-typos')) {
      result = await fixTypos(result);
    }

    // 5. Remove redundancy (if enabled)
    if (enabledFeatures.has('remove-redundancy')) {
      result = await removeRedundancy(result);
    }

    // 6. Fix punctuation (if enabled)
    if (enabledFeatures.has('fix-punctuation')) {
      result = fixPunctuation(result);
    }

    // 7. Add spaces around English (if enabled)
    if (enabledFeatures.has('add-spaces')) {
      result = addSpacesAroundEnglish(result);
    }

    // 8. Segment paragraphs last (if enabled)
    if (enabledFeatures.has('segment-paragraphs')) {
      result = segmentParagraphs(result);
    }

    const endTime = performance.now();
    const processingTime = (endTime - startTime) / 1000; // Convert to seconds

    return {
      text: result,
      processingTime,
    };
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
}

/**
 * Preload dictionaries for faster processing
 */
export async function preloadDictionaries(): Promise<void> {
  try {
    await Promise.all([
      loadS2TDictionary(),
      loadTypoDictionary(),
      loadRedundancyDictionary()
    ]);
  } catch (error) {
    console.error('Error preloading dictionaries:', error);
  }
}

/**
 * Get feature display information
 */
export interface Feature {
  id: FeatureType;
  label: string;
  description: string;
  icon?: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'simplified-to-traditional',
    label: '簡體轉繁體',
    description: '將簡體中文轉換為繁體中文（台灣用字）',
    icon: '🔄',
  },
  {
    id: 'add-spaces',
    label: '英文加空白',
    description: '在中文與英文、數字之間自動加入空格',
    icon: '␣',
  },
  {
    id: 'fix-typos',
    label: '修正錯字',
    description: '根據字典修正常見的錯別字',
    icon: '✏️',
  },
  {
    id: 'remove-redundancy',
    label: '刪除贅字',
    description: '移除不必要的發語詞和重複用字',
    icon: '🗑️',
  },
  {
    id: 'fix-punctuation',
    label: '修正標點',
    description: '統一全形/半形標點符號，修正常見錯誤',
    icon: '。',
  },
  {
    id: 'segment-paragraphs',
    label: '語義分段',
    description: '根據規則將文字適當分段',
    icon: '¶',
  },
  {
    id: 'remove-timestamps',
    label: '刪除時間戳',
    description: '移除影片字幕中的時間戳記',
    icon: '⏱️',
  },
];
