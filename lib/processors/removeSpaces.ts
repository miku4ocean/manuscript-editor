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
  //
  // 注意：只刪同一行內的水平空白（空格/tab）。曾經用 \s+ 連換行一起吞，
  // 導致字幕/逐字稿這類「行尾無標點」的多行文稿被整篇併成一行、
  // 連 \n\n 段落分隔都被消滅——換行不是「多餘空白」，交給語義分段功能處理。
  while (result !== prevResult) {
    prevResult = result;

    // Remove spaces between Chinese characters
    // 中文字之間的空白刪除
    result = result.replace(/([一-鿿])[ \t]+([一-鿿])/g, '$1$2');

    // Remove spaces between Chinese and Chinese punctuation
    result = result.replace(/([一-鿿])[ \t]+([，。！？、；：」』）])/g, '$1$2');
    result = result.replace(/([「『（])[ \t]+([一-鿿])/g, '$1$2');
  }

  return result;
}
