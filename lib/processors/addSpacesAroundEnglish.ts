/**
 * Feature 2: 英文字前後加空白
 * Add spaces around English words and numbers (Pangu spacing)
 */

export function addSpacesAroundEnglish(text: string): string {
  if (!text) return text;

  let result = text;

  // Define Chinese punctuation marks
  const chinesePunctuation = '，。！？；：、「」『』（）《》【】…—';

  // 注意：以下清理規則只處理同一行內的水平空白（空格/tab）。
  // 曾經用 \s 連換行一起吞——\s{2,} 會把 \n\n 段落分隔壓成一個空格，
  // 「英文加空白」一開，整篇多段文稿就被併成一段。

  // 1. Remove spaces between English/Numbers and punctuation marks
  // e.g., "iPhone 、" -> "iPhone、", "Android ，" -> "Android，"
  result = result.replace(/([a-zA-Z0-9])[ \t]+([，。！？；：、）」』\]\}）])/g, '$1$2');

  // 2. Remove spaces after punctuation marks before English/Numbers
  // e.g., "， The" -> "，The"
  result = result.replace(/([，。！？；：、（「『\[\{（])[ \t]+([a-zA-Z0-9])/g, '$1$2');

  // 3. Add space between Chinese and English/Number
  // But NOT if Chinese character is a punctuation mark
  result = result.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9@])/g, (match, p1, p2) => {
    // Check if p1 is a punctuation mark
    if (chinesePunctuation.includes(p1)) {
      return match; // Don't add space
    }
    return `${p1} ${p2}`;
  });

  // 4. English/Number -> Chinese (not if preceded by or followed by punctuation)
  result = result.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, (match, p1, p2) => {
    // Check if p2 is a punctuation mark
    if (chinesePunctuation.includes(p2)) {
      return match; // Don't add space
    }
    return `${p1} ${p2}`;
  });

  // 5. Remove spaces before Chinese punctuation marks
  result = result.replace(/[ \t]+([，。！？；：、）」』\]\}）])/g, '$1');

  // 6. Remove spaces after opening Chinese punctuation marks
  result = result.replace(/([（「『\[\{（])[ \t]+/g, '$1');

  // 7. Remove duplicate spaces (horizontal only, keep newlines)
  result = result.replace(/[ \t]{2,}/g, ' ');

  return result;
}
