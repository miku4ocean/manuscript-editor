import { describe, it, expect } from 'vitest';
import { fixPunctuation } from './fixPunctuation';

describe('fixPunctuation', () => {
  it('returns empty/falsy input unchanged', () => {
    expect(fixPunctuation('')).toBe('');
  });

  it('converts half-width punctuation to full-width near Chinese text', () => {
    const result = fixPunctuation('你好,世界.');
    expect(result).toContain('，');
    expect(result).toContain('。');
  });

  it('collapses duplicate punctuation marks into a single one', () => {
    expect(fixPunctuation('真的嗎？？？')).toBe('真的嗎？');
  });

  it('adds a trailing period to a Chinese paragraph missing one', () => {
    const result = fixPunctuation('這是一個測試');
    expect(result.endsWith('。')).toBe(true);
  });

  it('converts straight double quotes around Chinese text to 「」', () => {
    const result = fixPunctuation('他說"你好嗎"');
    expect(result).toContain('「你好嗎」');
  });

  it('removes spaces before Chinese closing punctuation', () => {
    const result = fixPunctuation('你好 ，世界');
    expect(result).not.toContain(' ，');
  });
});
