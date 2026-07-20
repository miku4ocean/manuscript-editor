import { describe, it, expect } from 'vitest';
import { removeTimestamps, hasTimestamps } from './removeTimestamps';

describe('removeTimestamps', () => {
  it('returns empty input unchanged', () => {
    expect(removeTimestamps('')).toBe('');
  });

  it('removes bracketed HH:MM:SS timestamps', () => {
    expect(removeTimestamps('[00:01:23] 大家好')).toBe('大家好');
  });

  it('removes parenthesised MM:SS timestamps', () => {
    expect(removeTimestamps('(01:23) 開始錄影')).toBe('開始錄影');
  });

  it('removes angle-bracket timestamps', () => {
    expect(removeTimestamps('<00:00:05> 測試')).toBe('測試');
  });

  it('removes standalone HH:MM:SS with milliseconds', () => {
    expect(removeTimestamps('片段於 00:01:23.456 結束')).toBe('片段於 結束');
  });

  it('collapses runs of blank lines down (whitespace trimming leaves a single newline)', () => {
    // The per-line trailing/leading whitespace cleanup runs before the
    // \n{3,} collapse and already consumes most of a run of blank lines,
    // so 4 newlines end up reduced to a single one, not two.
    const result = removeTimestamps('第一段\n\n\n\n第二段');
    expect(result).toBe('第一段\n第二段');
  });

  describe('hasTimestamps', () => {
    it('detects bracketed timestamps', () => {
      expect(hasTimestamps('[00:00:00] 開場')).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(hasTimestamps('這裡沒有時間戳記')).toBe(false);
    });

    it('returns false for empty input', () => {
      expect(hasTimestamps('')).toBe(false);
    });
  });
});
