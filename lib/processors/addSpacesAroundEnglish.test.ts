import { describe, it, expect } from 'vitest';
import { addSpacesAroundEnglish } from './addSpacesAroundEnglish';

describe('addSpacesAroundEnglish', () => {
  it('returns empty input unchanged', () => {
    expect(addSpacesAroundEnglish('')).toBe('');
  });

  it('adds a space between Chinese and English/number', () => {
    expect(addSpacesAroundEnglish('我有3個iPhone手機')).toBe('我有 3 個 iPhone 手機');
  });

  it('does not add a space between punctuation and English', () => {
    const result = addSpacesAroundEnglish('這是，English 內容');
    expect(result).not.toContain('，English'.split('').join(' '));
    expect(result.startsWith('這是，English')).toBe(true);
  });

  it('removes stray space between English/number and closing punctuation', () => {
    const result = addSpacesAroundEnglish('iPhone 、下一項');
    expect(result).toContain('iPhone、');
  });

  it('collapses duplicate spaces', () => {
    const result = addSpacesAroundEnglish('hello  world');
    expect(result).not.toContain('  ');
  });

  // 真 bug 迴歸：步驟 7 的 \s{2,} 把段落分隔 \n\n 壓成一個空格，
  // 導致「英文加空白」一開，整篇多段文稿被併成一段。
  it('preserves blank-line paragraph separators (多段文稿不被併段)', () => {
    const input = '第一段有 English 內容。\n\n第二段也有 iPhone 內容。';
    expect(addSpacesAroundEnglish(input)).toBe(input);
  });

  it('adds spaces line-by-line without touching single newlines', () => {
    expect(addSpacesAroundEnglish('我有3個蘋果\n他有5個橘子')).toBe(
      '我有 3 個蘋果\n他有 5 個橘子'
    );
  });
});
