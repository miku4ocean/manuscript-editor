/**
 * Feature 7: 刪除時間戳記
 * Remove common timestamp formats from text
 */

export function removeTimestamps(text: string): string {
  if (!text) return text;

  let result = text;

  // Define timestamp patterns with their replacement strategies
  const patternsWithoutCaptureGroups = [
    // [HH:MM:SS] or [MM:SS]
    /\[\d{1,2}:\d{2}:\d{2}\]/g,
    /\[\d{1,2}:\d{2}\]/g,

    // (HH:MM:SS) or (MM:SS)
    /\(\d{1,2}:\d{2}:\d{2}\)/g,
    /\(\d{1,2}:\d{2}\)/g,

    // <HH:MM:SS> or <MM:SS>
    /<\d{1,2}:\d{2}:\d{2}>/g,
    /<\d{1,2}:\d{2}>/g,

    // HH:MM:SS.mmm (with milliseconds)
    /\b\d{1,2}:\d{2}:\d{2}\.\d{1,3}\b/g,

    // HH:MM:SS (standalone)
    /\b\d{1,2}:\d{2}:\d{2}\b/g,

    // Additional format: 【HH:MM:SS】
    /【\d{1,2}:\d{2}:\d{2}】/g,
    /【\d{1,2}:\d{2}】/g,
  ];

  // Patterns with capture groups need special handling
  const patternsWithCaptureGroups = [
    // MM:SS (standalone) - preserve leading space or newline
    /(^|\s)\d{1,2}:\d{2}(?=\s|$)/g,
  ];

  // Remove patterns without capture groups - just replace with empty string
  for (const pattern of patternsWithoutCaptureGroups) {
    result = result.replace(pattern, '');
  }

  // Remove patterns with capture groups - preserve the captured group
  for (const pattern of patternsWithCaptureGroups) {
    result = result.replace(pattern, '$1');
  }

  // Clean up extra spaces that may have been left
  // First, handle spaces on the same line (don't touch newlines)
  result = result.replace(/ {2,}/g, ' '); // Multiple spaces -> single space (not all whitespace)
  result = result.replace(/^\s+/gm, ''); // Leading spaces/tabs on each line
  result = result.replace(/\s+$/gm, ''); // Trailing spaces/tabs on each line

  // Clean up excessive empty lines (more than 2 consecutive newlines)
  result = result.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines

  return result.trim();
}

/**
 * Check if a string contains timestamps
 */
export function hasTimestamps(text: string): boolean {
  if (!text) return false;

  const patterns = [
    /\[\d{1,2}:\d{2}:\d{2}\]/,
    /\[\d{1,2}:\d{2}\]/,
    /\(\d{1,2}:\d{2}:\d{2}\)/,
    /\(\d{1,2}:\d{2}\)/,
    /<\d{1,2}:\d{2}:\d{2}>/,
    /<\d{1,2}:\d{2}>/,
    /\b\d{1,2}:\d{2}:\d{2}\.\d{1,3}\b/,
    /\b\d{1,2}:\d{2}:\d{2}\b/,
    /【\d{1,2}:\d{2}:\d{2}】/,
    /【\d{1,2}:\d{2}】/,
  ];

  return patterns.some((pattern) => pattern.test(text));
}
