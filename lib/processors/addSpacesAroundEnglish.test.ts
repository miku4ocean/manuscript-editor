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
});
