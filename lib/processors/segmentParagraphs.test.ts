import { describe, it, expect } from 'vitest';
import { segmentParagraphs } from './segmentParagraphs';

describe('segmentParagraphs', () => {
  it('returns empty input unchanged', () => {
    expect(segmentParagraphs('')).toBe('');
  });

  it('merges single line breaks within a paragraph', () => {
    const result = segmentParagraphs('第一句話\n第二句話');
    expect(result).toBe('第一句話 第二句話');
  });

  it('preserves double line breaks as paragraph separators', () => {
    const result = segmentParagraphs('第一段內容\n\n第二段內容');
    expect(result).toBe('第一段內容\n\n第二段內容');
  });

  it('normalises more than two line breaks down to exactly two', () => {
    const result = segmentParagraphs('第一段\n\n\n\n第二段');
    expect(result).toBe('第一段\n\n第二段');
  });

  it('splits an overly long paragraph at sentence boundaries', () => {
    const sentence = '這是一句非常重要的話。';
    const longPara = sentence.repeat(60); // well over default maxParagraphLength
    const result = segmentParagraphs(longPara, { maxParagraphLength: 100 });
    expect(result).toContain('\n\n');
    // Every split chunk should still end on a sentence boundary
    const chunks = result.split('\n\n');
    for (const chunk of chunks) {
      expect(/[。！？]$/.test(chunk)).toBe(true);
    }
  });
});
