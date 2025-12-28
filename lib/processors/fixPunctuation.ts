/**
 * Feature 5: 修正標點符號
 * Fix punctuation marks (full-width for Chinese, half-width for English)
 */

export function fixPunctuation(text: string): string {
  if (!text) return text;

  let result = text;

  // 1. Convert ALL half-width punctuation to full-width for Chinese context
  // Convert half-width to full-width when near Chinese characters
  result = result.replace(/([\u4e00-\u9fa5]),/g, '$1，'); // comma
  result = result.replace(/([\u4e00-\u9fa5])\./g, '$1。'); // period
  result = result.replace(/,(?=[\u4e00-\u9fa5])/g, '，'); // comma before Chinese
  result = result.replace(/\.(?=[\u4e00-\u9fa5])/g, '。'); // period before Chinese

  // Convert more punctuation types
  result = result.replace(/([\u4e00-\u9fa5]):/g, '$1：'); // colon
  result = result.replace(/([\u4e00-\u9fa5]);/g, '$1；'); // semicolon
  result = result.replace(/([\u4e00-\u9fa5])\?/g, '$1？'); // question mark
  result = result.replace(/([\u4e00-\u9fa5])!/g, '$1！'); // exclamation mark

  // 2. 【NEW】Remove ALL duplicate punctuation marks aggressively
  // Multiple consecutive punctuation -> single
  result = result.replace(/，{2,}/g, '，');
  result = result.replace(/。{2,}/g, '。');
  result = result.replace(/！{2,}/g, '！');
  result = result.replace(/？{2,}/g, '？');
  result = result.replace(/；{2,}/g, '；');
  result = result.replace(/：{2,}/g, '：');
  result = result.replace(/、{2,}/g, '、');

  // Also handle half-width duplicates
  result = result.replace(/,,{1,}/g, '，');
  result = result.replace(/\.\.{1,}/g, '。');
  result = result.replace(/!!{1,}/g, '！');
  result = result.replace(/\?\?{1,}/g, '？');

  // 3. Fix quotation marks
  // Replace straight quotes with Chinese quotation marks when surrounding Chinese text
  result = result.replace(/"([\u4e00-\u9fa5][^"]*[\u4e00-\u9fa5])"/g, '「$1」');
  result = result.replace(/'([\u4e00-\u9fa5][^']*[\u4e00-\u9fa5])'/g, '『$1』');

  // 4. Fix parentheses in Chinese context
  result = result.replace(/\(([\u4e00-\u9fa5][^)]*[\u4e00-\u9fa5])\)/g, '（$1）');

  // 5. Remove spaces before Chinese punctuation
  result = result.replace(/\s+([，。！？；：、）」』])/g, '$1');

  // 6. Remove spaces after opening punctuation
  result = result.replace(/([（「『])\s+/g, '$1');

  // 7. Ensure space after punctuation when followed by English
  result = result.replace(/([，。！？；：])([a-zA-Z])/g, '$1 $2');

  // 8. Fix ellipsis
  result = result.replace(/\.{3,}/g, '⋯⋯');
  result = result.replace(/。{3,}/g, '⋯⋯');

  // 9. 【NEW】Add period at end of paragraph if missing
  // Split by double newlines (paragraphs)
  const paragraphs = result.split(/\n\n+/);
  result = paragraphs.map(para => {
    para = para.trim();
    if (!para) return para;

    // Check if paragraph ends with punctuation
    const lastChar = para[para.length - 1];
    const hasPunctuation = /[。！？；：」』）]/.test(lastChar);

    // If last char is Chinese and no punctuation, add period
    if (!hasPunctuation && /[\u4e00-\u9fa5]/.test(lastChar)) {
      return para + '。';
    }

    return para;
  }).join('\n\n');

  // 10. Clean up multiple spaces
  result = result.replace(/\s{2,}/g, ' ');

  console.log('✅ Fixed punctuation: half-width→full-width, removed duplicates, added sentence endings');

  return result;
}
