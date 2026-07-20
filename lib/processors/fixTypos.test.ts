import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fixTyposSync } from './fixTypos';

const typoDictionary: Record<string, string> = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../public/dictionaries/typo-dictionary.json'), 'utf8')
);

describe('fixTyposSync', () => {
  it('returns empty input unchanged', () => {
    expect(fixTyposSync('', typoDictionary)).toBe('');
  });

  it('returns text unchanged when dictionary is empty', () => {
    expect(fixTyposSync('這件事很作崇', {})).toBe('這件事很作崇');
  });

  it('corrects 作崇 to 作祟 using the real dictionary', () => {
    expect(fixTyposSync('這件事很作崇', typoDictionary)).toBe('這件事很作祟');
  });

  it('corrects 座落 to 坐落', () => {
    expect(fixTyposSync('這個房子座落在山上', typoDictionary)).toBe('這個房子坐落在山上');
  });

  it('corrects 磨擦 to 摩擦', () => {
    expect(fixTyposSync('物體之間會產生磨擦', typoDictionary)).toBe('物體之間會產生摩擦');
  });

  it('applies a caller-supplied dictionary without touching the module-level cache', () => {
    const custom = { 測試錯字: '測試正確字' };
    expect(fixTyposSync('這是測試錯字', custom)).toBe('這是測試正確字');
  });
});
