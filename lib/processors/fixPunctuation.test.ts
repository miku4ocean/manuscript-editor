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

  it('collapses a half-width "..." ellipsis into ⋯⋯ instead of garbled 。。', () => {
    // 曾經是真 bug：dedup 規則（步驟2）比省略號規則先跑，把連續句點吃掉
    // 只剩「Chinese字+單一句點」再各自轉全形，最後兩個獨立全形句點併在一起
    // 從沒被 dedup 到，吐出「等等。。」這種殘破結果。
    expect(fixPunctuation('等等...')).toBe('等等⋯⋯');
    expect(fixPunctuation('等等....')).toBe('等等⋯⋯');
  });

  it('collapses a full-width "。。。" run into ⋯⋯ instead of a lone 。', () => {
    expect(fixPunctuation('你好。。。')).toBe('你好⋯⋯');
  });

  it('handles multiple ellipses in one string cleanly (no stray raw dots)', () => {
    const result = fixPunctuation('省略號...继续说下去....');
    expect(result).toBe('省略號⋯⋯继续说下去⋯⋯');
    expect(result).not.toContain('.');
  });
});
