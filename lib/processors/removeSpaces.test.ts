import { describe, it, expect } from 'vitest';
import { removeUnnecessarySpaces } from './removeSpaces';

describe('removeUnnecessarySpaces', () => {
  it('returns empty input unchanged', () => {
    expect(removeUnnecessarySpaces('')).toBe('');
  });

  it('removes single spaces between Chinese characters', () => {
    expect(removeUnnecessarySpaces('今 日 透過')).toBe('今日透過');
  });

  it('removes spaces between Chinese characters and punctuation', () => {
    expect(removeUnnecessarySpaces('你好 ，世界 。')).toBe('你好，世界。');
  });

  it('removes spaces after opening Chinese punctuation but not before it', () => {
    // Only the space *inside* the brackets (around the Chinese text) is
    // stripped; there is no rule for a space between a Chinese char and a
    // following opening bracket, so it is left untouched.
    expect(removeUnnecessarySpaces('他說 「 你好 」')).toBe('他說 「你好」');
  });

  it('keeps spaces that surround English words', () => {
    expect(removeUnnecessarySpaces('我用 iPhone 拍照')).toBe('我用 iPhone 拍照');
  });
});
