import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { simplifiedToTraditional } from './simplifiedToTraditional';

const s2tDictionary: Record<string, string> = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../public/dictionaries/s2t-dictionary.json'), 'utf8')
);

describe('simplifiedToTraditional', () => {
  it('returns empty input unchanged', () => {
    expect(simplifiedToTraditional('', s2tDictionary)).toBe('');
  });

  it('returns text unchanged when dictionary is empty', () => {
    expect(simplifiedToTraditional('电脑', {})).toBe('电脑');
  });

  it('converts single simplified characters to traditional', () => {
    expect(simplifiedToTraditional('简体字', s2tDictionary)).toBe('簡體字');
  });

  it('converts a mixed sentence of simplified characters', () => {
    const result = simplifiedToTraditional('电脑软件和网络', s2tDictionary);
    expect(result).toContain('電');
    expect(result).toContain('網');
  });

  it('leaves already-traditional text unchanged', () => {
    expect(simplifiedToTraditional('繁體中文', s2tDictionary)).toBe('繁體中文');
  });
});
