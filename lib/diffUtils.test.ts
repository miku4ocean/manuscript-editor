import { describe, it, expect } from 'vitest';
import {
  calculateDiff,
  calculateStatistics,
  mergeConsecutiveSegments,
  getDiffColorClass,
  getDiffLabel,
} from './diffUtils';

describe('calculateDiff', () => {
  it('returns a single equal segment for identical text', () => {
    const segments = calculateDiff('相同的文字', '相同的文字');
    expect(segments.every((s) => s.type === 'equal')).toBe(true);
    expect(segments.map((s) => s.text).join('')).toBe('相同的文字');
  });

  it('detects an insertion', () => {
    const segments = calculateDiff('你好', '你好嗎');
    const inserted = segments.filter((s) => s.type === 'insert').map((s) => s.text).join('');
    expect(inserted).toBe('嗎');
  });

  it('detects a deletion', () => {
    const segments = calculateDiff('你好嗎', '你好');
    const deleted = segments.filter((s) => s.type === 'delete').map((s) => s.text).join('');
    expect(deleted).toBe('嗎');
  });
});

describe('calculateStatistics', () => {
  it('counts insertions and deletions by character length', () => {
    const segments = [
      { type: 'equal' as const, text: '你好' },
      { type: 'delete' as const, text: '舊字' },
      { type: 'insert' as const, text: '新字詞' },
    ];
    const stats = calculateStatistics(segments);
    expect(stats.insertions).toBe(3);
    expect(stats.deletions).toBe(2);
    expect(stats.modifications).toBe(2);
    expect(stats.totalChanges).toBe(2);
  });

  it('returns all zeros when there are no changes', () => {
    const stats = calculateStatistics([{ type: 'equal', text: '沒有變化' }]);
    expect(stats).toEqual({ insertions: 0, deletions: 0, modifications: 0, totalChanges: 0 });
  });
});

describe('mergeConsecutiveSegments', () => {
  it('returns an empty array for empty input', () => {
    expect(mergeConsecutiveSegments([])).toEqual([]);
  });

  it('merges adjacent segments of the same type', () => {
    const merged = mergeConsecutiveSegments([
      { type: 'equal', text: 'A' },
      { type: 'equal', text: 'B' },
      { type: 'insert', text: 'C' },
    ]);
    expect(merged).toEqual([
      { type: 'equal', text: 'AB' },
      { type: 'insert', text: 'C' },
    ]);
  });
});

describe('getDiffColorClass / getDiffLabel', () => {
  it('returns the expected class for each diff type', () => {
    expect(getDiffColorClass('insert')).toContain('green');
    expect(getDiffColorClass('delete')).toContain('red');
    expect(getDiffColorClass('equal')).toBe('');
  });

  it('returns the expected label for each diff type', () => {
    expect(getDiffLabel('insert')).toBe('新增');
    expect(getDiffLabel('delete')).toBe('刪除');
    expect(getDiffLabel('equal')).toBe('相同');
  });
});
