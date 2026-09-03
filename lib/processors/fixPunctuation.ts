/**
 * Feature 5: 修正標點符號
 * Fix punctuation marks (full-width for Chinese, half-width for English)
 */

export function fixPunctuation(text: string): string {
  if (!text) return text;

  let result = text;

  // 0. Collapse ellipses FIRST — must run before dot→period conversion (step 1)
  // and duplicate-punctuation dedup (step 2). Those later steps only ever see
  // one dot/period at a time getting converted (Chinese-char + single dot) and
  // then dedup adjacent identical marks — neither step recognizes a *run* of
  // 3+ raw dots as a single unit. By the time this rule used to run (step 8,
  // now removed below), the run had already been partially consumed/converted,
  // so it never matched — it was dead code. Worse, the leftover fragments
  // combined into garbled output like "省略號。.。" instead of a clean "⋯⋯".
  result = result.replace(/\.{3,}/g, '⋯⋯');
  result = result.replace(/。{3,}/g, '⋯⋯');

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

  // 5. Remove spaces before Chinese punctuation (horizontal only, keep newlines)
  result = result.replace(/[ \t]+([，。！？；：、）」』])/g, '$1');

  // 6. Remove spaces after opening punctuation
  result = result.replace(/([（「『])[ \t]+/g, '$1');

  // 7. Ensure space after punctuation when followed by English
  result = result.replace(/([，。！？；：])([a-zA-Z])/g, '$1 $2');

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

  // 10. Clean up multiple spaces — horizontal only。曾經用 \s{2,}，
  // 把步驟 9 剛用 \n\n join 回去的段落分隔立刻壓成一個空格，
  // 「修正標點」一開多段文稿必定被併成一段。
  result = result.replace(/[ \t]{2,}/g, ' ');

  console.log('✅ Fixed punctuation: half-width→full-width, removed duplicates, added sentence endings');

  return result;
}
