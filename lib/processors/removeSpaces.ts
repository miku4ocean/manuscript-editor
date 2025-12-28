/**
 * Remove unnecessary spaces between Chinese characters
 * Keep spaces around English words
 */
export function removeUnnecessarySpaces(text: string): string {
  if (!text) return text;

  let result = text;
  let prevResult = '';

  // Keep applying the replacements until no more changes occur
  // This handles cases like "今 日 透過" where we need multiple passes
  while (result !== prevResult) {
    prevResult = result;

    // Remove spaces between Chinese characters
    // 中文字之間的空白刪除
    result = result.replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2');

    // Remove spaces between Chinese and Chinese punctuation
    result = result.replace(/([\u4e00-\u9fff])\s+([，。！？、；：」』）])/g, '$1$2');
    result = result.replace(/([「『（])\s+([\u4e00-\u9fff])/g, '$1$2');
  }

  return result;
}
