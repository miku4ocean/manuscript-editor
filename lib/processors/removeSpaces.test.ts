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

  // 真 bug 迴歸：\s+ 把換行也當成「多餘空白」吞掉，
  // 造成字幕/逐字稿這類「行尾無標點」的多行文稿被整個併成一行。
  it('preserves a single newline between Chinese lines (字幕逐字稿不被併行)', () => {
    const input = '大家好\n今天我們來聊聊新主題';
    expect(removeUnnecessarySpaces(input)).toBe(input);
  });

  it('preserves blank-line paragraph separators between Chinese paragraphs', () => {
    const input = '第一段結尾\n\n第二段開始';
    expect(removeUnnecessarySpaces(input)).toBe(input);
  });

  it('still removes horizontal spaces on each line of a multi-line text', () => {
    expect(removeUnnecessarySpaces('今 日 天氣\n真 的 很好')).toBe('今日天氣\n真的很好');
  });
});
