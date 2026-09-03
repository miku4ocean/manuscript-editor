import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { removeRedundancySync } from './removeRedundancy';

const redundancyDictionary = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../public/dictionaries/redundancy-dictionary.json'), 'utf8')
);

describe('removeRedundancySync', () => {
  it('returns empty input unchanged', () => {
    expect(removeRedundancySync('', redundancyDictionary)).toBe('');
  });

  it('removes filler words using the real dictionary', () => {
    const result = removeRedundancySync('其實，我覺得這個想法很好。', redundancyDictionary);
    expect(result).not.toContain('其實');
  });

  it('collapses two-character duplicate patterns supplied by the dictionary (的的 -> 的)', () => {
    // Single-character doubling (的的) is only collapsed via an explicit
    // dictionary "pattern" entry (step 3) - the generic repeated-word
    // detector (step 5) only scans word lengths >= 2 characters.
    const result = removeRedundancySync('這個的的確確是真的的', {
      fillerWords: [],
      patterns: ['的的'],
    });
    expect(result).not.toContain('的的');
  });

  it('collapses an immediately repeated multi-character word (確確是真 -> 確是真 via generic detector)', () => {
    const result = removeRedundancySync('這是確認確認的結果', { fillerWords: [], patterns: [] });
    expect(result).toBe('這是確認的結果');
  });

  it('confirms the real dictionary includes 的的 as a pattern', () => {
    expect(redundancyDictionary.patterns).toContain('的的');
  });

  it('fixes colloquial overlapping expressions (一下下 -> 一下)', () => {
    const result = removeRedundancySync('等一下下再說', { fillerWords: [], patterns: [] });
    expect(result).toContain('等一下');
    expect(result).not.toContain('一下下');
  });

  it('removes excessive consecutive punctuation', () => {
    const result = removeRedundancySync('太好了，，，', { fillerWords: [], patterns: [] });
    expect(result).toBe('太好了，');
  });

  it('removes redundant phrases when present in dictionary', () => {
    const dict = { fillerWords: [], patterns: [], redundantPhrases: ['廢話不多說'] };
    const result = removeRedundancySync('廢話不多說，我們開始吧。', dict);
    expect(result).not.toContain('廢話不多說');
  });

  // 真 bug 迴歸：步驟 7 的 \s{2,} 把段落分隔 \n\n 壓成一個空格，
  // 導致「刪除贅字」一開，整篇多段文稿被併成一段。
  it('preserves blank-line paragraph separators (多段文稿不被併段)', () => {
    const input = '第一段的內容。\n\n第二段的內容。';
    expect(removeRedundancySync(input, { fillerWords: [], patterns: [] })).toBe(input);
  });

  it('still collapses runs of spaces within a line', () => {
    const result = removeRedundancySync('這裡有    多餘空白', { fillerWords: [], patterns: [] });
    expect(result).toBe('這裡有 多餘空白');
  });
});
