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

  it('collapses an immediately repeated multi-character word (資料資料 -> 資料 via generic detector)', () => {
    const result = removeRedundancySync('這是資料資料的整理', { fillerWords: [], patterns: [] });
    expect(result).toBe('這是資料的整理');
  });

  // ABAB 動詞重疊是正常用法，不能被當贅字刪掉
  it('keeps ABAB verb reduplication (研究研究、討論討論)', () => {
    const empty = { fillerWords: [], patterns: [] };
    expect(removeRedundancySync('我們來研究研究這個問題。', empty)).toBe('我們來研究研究這個問題。');
    expect(removeRedundancySync('大家先討論討論再決定。', empty)).toBe('大家先討論討論再決定。');
    expect(removeRedundancySync('你再考慮考慮、確認確認。', empty)).toBe('你再考慮考慮、確認確認。');
    // 真實字典下也不受影響
    expect(removeRedundancySync('我們研究研究，再討論討論。', redundancyDictionary)).toBe('我們研究研究，再討論討論。');
  });

  it('still collapses non-verb stutter and ABAB with a space between', () => {
    const empty = { fillerWords: [], patterns: [] };
    expect(removeRedundancySync('這個功能功能很好', empty)).toBe('這個功能很好');
    expect(removeRedundancySync('結果結果出來了', empty)).toBe('結果出來了');
    expect(removeRedundancySync('我們研究 研究 這件事', empty)).toBe('我們研究 這件事');
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

  // 真 bug 迴歸：舊字典把「好、很、真、滿、超、挺」當單字贅詞，後接標點就刪（天氣很好。→天氣很。），
  // 並把太太／看看／個個等正常疊字縮成單字。
  it('正常句子經「刪除贅字」處理後完全不變', () => {
    const sentences = [
      '天氣很好。', '今天真的很棒！', '他滿好的。', '這個超好吃。', '挺好的，不錯。', '我想要這個。',
      '太太說她看看再決定。', '個個都很努力。', '謝謝你，媽媽。', '爸爸和哥哥、姊姊一起看星星。',
      '他常常慢慢走，剛剛才試試看，想想辦法，走走停停。', '沒錯。', '好啊。', '可以嗎？', '無論如何都要完成。',
      '我覺得大家好，一個一個來，一步一步走。', '這是什麼？', '他非常高興。', '是不是這樣？',
    ];
    for (const s of sentences) {
      expect(removeRedundancySync(s, redundancyDictionary)).toBe(s);
    }
  });

  it('明確的口語贅詞仍被刪除', () => {
    expect(removeRedundancySync('嗯，我們開始吧。', redundancyDictionary)).toBe('我們開始吧。');
    expect(removeRedundancySync('呃，這件事很重要。', redundancyDictionary)).toBe('這件事很重要。');
    expect(removeRedundancySync('我們來看，就是說，這個結果。', redundancyDictionary)).toBe('我們來看，這個結果。');
    expect(removeRedundancySync('那個那個，我先說明。', redundancyDictionary)).toBe('我先說明。');
    expect(removeRedundancySync('其實，我覺得可以。', redundancyDictionary)).toBe('我覺得可以。');
    expect(removeRedundancySync('這是這是我的想法。', redundancyDictionary)).toBe('這是我的想法。');
  });

  it('字典不再含會毀損語意的單字贅詞與正常疊字', () => {
    for (const w of ['好', '很', '真', '滿', '超', '挺']) expect(redundancyDictionary.fillerWords).not.toContain(w);
    for (const p of ['太太', '看看', '個個', '謝謝', '媽媽', '爸爸', '哥哥', '姊姊', '星星', '常常', '慢慢', '剛剛', '試試', '想想', '走走'])
      expect(redundancyDictionary.patterns).not.toContain(p);
  });
});
