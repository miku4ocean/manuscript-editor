import { describe, it, expect } from 'vitest';
import { generateFilename, getTextStatistics, formatNumber } from './exportUtils';

describe('generateFilename', () => {
  it('uses the default prefix and a .txt extension', () => {
    const filename = generateFilename();
    expect(filename.startsWith('manuscript_edited_')).toBe(true);
    expect(filename.endsWith('.txt')).toBe(true);
  });

  it('matches the expected timestamp pattern', () => {
    const filename = generateFilename('draft');
    expect(filename).toMatch(/^draft_\d{8}_\d{6}\.txt$/);
  });
});

describe('getTextStatistics', () => {
  it('returns all zeros for empty text', () => {
    expect(getTextStatistics('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
    });
  });

  it('counts characters, lines and paragraphs correctly', () => {
    const stats = getTextStatistics('第一段文字\n\n第二段 with English');
    expect(stats.paragraphs).toBe(2);
    expect(stats.lines).toBe(3);
    expect(stats.charactersNoSpaces).toBeLessThan(stats.characters);
  });

  it('counts Chinese characters and English words separately', () => {
    const stats = getTextStatistics('你好 world');
    // 你, 好 = 2 Chinese chars + 1 English word "world"
    expect(stats.words).toBe(3);
  });
});

describe('formatNumber', () => {
  it('formats numbers with thousand separators', () => {
    expect(formatNumber(1234567)).toBe((1234567).toLocaleString('zh-TW'));
  });

  it('formats small numbers without separators', () => {
    expect(formatNumber(42)).toBe('42');
  });
});
